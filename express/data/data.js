const {initBucket,addFile,getFile,deleteFile,getPresignedUrl} = require('./fileStorage');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const {getUser,userExists} = require('./users');

const BUCKET_NAME = process.env.S3_BUCKET;

initBucket(BUCKET_NAME);
const data = [];

const addFileData = async (username,file) =>{
    const id = uuidv4();
    if(!userExists(username)){
        return;
    }
    const user = getUser(username);

    db.prepare('INSERT INTO files (id, name, owner_id, s3_key, created_at,version, visibility) VALUES (?,?,?,?,?,?,?)')
    .run(id, file.originalFilename || file.newFilename || file.name, user.id, id, Math.floor(Date.now()/1000),'1','private');

    await addFile(BUCKET_NAME, id+"v1", file)
}

const updateFileData = async (username,file,file_key) =>{
    const id = uuidv4();
    if(!userExists(username)){
        return;
    }
    const user = getUser(username);
    const old_file = await getFileData(file_key);

    if(!old_file || !user){
        return;
    }

    if(user.role != "admin" && old_file.owner_id != user.id){
        return;
    }
    db.prepare('UPDATE files SET name = ?, version = ?  WHERE id = ?')
    .run(file.originalFilename || file.newFilename || file.name,old_file.version + 1, file_key);
    db.prepare('INSERT INTO version (id, file_id, name, version, created_at) VALUES (?,?,?,?,?)')
    .run(id,old_file.id,old_file.name, old_file.version,Math.floor(Date.now()/1000));

    await addFile(BUCKET_NAME,old_file.id+"v"+(old_file.version + 1),file);
}

const addComment = (file_id,username,comment) => {
    const id = uuidv4();
    
    db.prepare('INSERT INTO comments (id, file_id, author_name, content, created_at) VALUES (?,?,?,?,?)')
    .run(id, file_id, username, comment, Math.floor(Date.now()/1000));
    console.log("comment save id "+file_id)
}

const getFileData = async (id) => {
    file = db.prepare("SELECT * FROM files WHERE id = ?").all(id)[0];
    if(!file){
        return null;
    }

    file.file = await getFile(BUCKET_NAME, id+"v"+file.version);
    file.access = []
    file.comments = db.prepare("SELECT * FROM comments WHERE file_id = ?").all(id);
    names = []
    access = db.prepare("SELECT users.username FROM file_acl INNER JOIN users ON users.id = file_acl.user_id WHERE file_acl.file_id = ?").all(id);
    for(const a of access){
        let aa = { username: a.username };
        
        if(!names.includes(a.username)){
            file.access.push(aa);
            names.push(a.username);
        }
    }

    ver = db.prepare("SELECT * FROM version WHERE file_id = ? order by version desc").all(id);
    versions = []
    const v1 = { version: file.version,file: file.file,name: file.name,contentType: file.ContentType };
    versions.push(v1)
    for(const vv of ver){
        versions.push(vv)
    }
    file.versions = versions;

    for(let i = v1.version - 1; i>=0;i--){
        const file_key = id+"v"+file.versions[i].version;
        file.versions[i].url = await getPresignedUrl(file_key)
        const fi = await await getFile(BUCKET_NAME,file_key);
        if(fi){
            file.versions[i].contentType = await fi.ContentType || 'application/octet-stream'
        }else{
            file.versions[i].contentType = 'application/octet-stream'
        }
    }

    return file;
}

const deleteFileDate = async(username,id) => {
    if(!userExists(username)){
        return;
    }
    user = getUser(username);
    file = await getFileData(id);
    if(!file || !(user.role == "admin" || file.owner_id != null && user.id == file.owner_id )){
        return;
    }

    db.prepare('DELETE FROM files WHERE id = ?').run(id);
    db.prepare('DELETE FROM file_acl WHERE file_id = ?').run(id);
    db.prepare('DELETE FROM comments WHERE file_id = ?').run(id);
    db.prepare('DELETE FROM version WHERE file_id = ?').run(id);

    for(let i = 1;i<=file.version;i++){
            deleteFile(BUCKET_NAME,file.s3_key+"v"+i);   
        }
}

const assignUserToFile = async (username,username2,file_id) => {
    if(!userExists(username) || !userExists(username2) || username == username2){
        return;
    }
    user = getUser(username);
    user2 = getUser(username2);
    file = await getFileData(file_id);
    if(!file){
        return;
    }

    if(user.role != "admin" && file.owner_id != null && file.owner_id != user.id ){
        return;
    }

    const id = uuidv4(); 
    const createdAt = Math.floor(Date.now() / 1000); 

    const stmt = db.prepare(`
        INSERT INTO file_acl (id, file_id, user_id, created_at)
        VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, file_id, user2.id, createdAt);
}

const updateFileVisibility = (fileId, newVisibility) => {
    if(newVisibility != 'private' && newVisibility != 'public'){
        return;
    }

    const stmt = db.prepare(`
        UPDATE files
        SET visibility = ?
        WHERE id = ?
    `);
    stmt.run(newVisibility, fileId);
}

const getFilesData = async (username) => {
    files = []
    if(!userExists(username)){
        return files;
    }

    user = getUser(username);
    for(file of getFilesQuery(user.role, user.id)){
        file.v = user.role == "admin" || file.owner_id != null &&  user.id == file.owner_id;
        file.file = await getFile(BUCKET_NAME, file.s3_key+"v"+file.version);
        files.push(file);
    }

    return files;
}

const getFilesQuery = (role, userId) => {
    if(role == "admin"){
        return db.prepare("SELECT * FROM files").all();
    }
    return db.prepare("SELECT files.* FROM files left join file_acl on file_acl.file_id = files.id WHERE files.visibility = 'public' or file_acl.user_id = ? or files.owner_id = ?").all(userId,userId);
}

module.exports = {addFileData, getFileData, getFilesData, updateFileVisibility, deleteFileDate,assignUserToFile,addComment,updateFileData};
