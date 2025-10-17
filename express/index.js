const path = require('path');
const session = require('express-session');
const express = require('express');
const hbs = require('express-handlebars');
const formidable = require('formidable');
const {addFileData, getFileData, getFilesData, updateFileVisibility, deleteFileDate,assignUserToFile,addComment,updateFileData} = require('./data/data');
const iconsCustom = require('./data/icons');
const {getPresignedUrl} = require('./data/fileStorage');
const init = require('./data/init');
const {getUser,addUser,userExists} = require('./data/users');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

process.env.TZ = "Europe/Warsaw";

let index = 0;


init()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'static')));
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main.hbs',
    helpers: iconsCustom,
    partialsDir: path.join(__dirname, 'views', 'partials')
}));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  if (req.session.userId) {
        res.render('home', { view: 'home', username: req.session.username });
  } else {
        res.render('login', { view: 'login' });
  }
});

app.get('/upload',isAuthenticated, (req, res) => {
    res.render('upload', { view: 'upload' });
});

app.post("/upload", isAuthenticated, (req, res) => {
  const uploadDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
    multiples: true,
  });

  form.on("fileBegin", (name, file) => {
    file.filepath = path.join(uploadDir, file.originalFilename || file.newFilename || file.name);
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return;

    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];

    try {
      for (const f of uploadedFiles) {
        const key = req.session.username;
        await addFileData(key, f);
      }
    } catch (e) {
      console.error("S3 Upload Error:", e);
    }
  });

  res.redirect('/upload');
});


app.get('/filemanager',isAuthenticated, async (req, res) => {
    const username = req.session.username;
    const files = await getFilesData(username)
    res.render('filemanager', { view: 'filemanager', files });
});

app.post("/filemanager/:id", isAuthenticated, (req, res) => {
  const uploadDir = path.join(__dirname, "uploads");
    const { id } = req.params;
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
    multiples: true,
  });

  form.on("fileBegin", (name, file) => {
    file.filepath = path.join(uploadDir, file.originalFilename || file.newFilename || file.name);
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send("Upload error");

    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];

    try {
      for (const f of uploadedFiles) {
        const key = req.session.username;
        await updateFileData(key, f, id);
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  res.redirect('/');
});

app.get('/files/:id', async (req, res) => {
    const { id } = req.params;
    const fi = await getFileData(id);
    if(!fi){
      res.redirect('/filemanager');
      return;
    }

    const { name, file,version,ownerName } = fi;

    if (!file || !name) {
      res.redirect('/filemanager');
      return;
    }

    const url = await getPresignedUrl(id+"v"+version);
    res.render('preview', {
      url,
      name,
      contentType: file.ContentType || 'application/octet-stream',
      ownerName: ownerName,
    });
});

app.get('/history/:id',isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const file = await getFileData(id);
    if(!file || !file.versions){
      res.redirect('/filemanager');
      return;
    }

    res.render('versions', {
      versions: file.versions,
      ownerName: file.ownerName,
    });
});

app.post('/files/:id/visibility', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { visibility } = req.body;

  if (['private', 'public'].includes(visibility)) {
    updateFileVisibility(id, visibility);
    res.json({ message: `Visibility pliku zaktualizowana na '${visibility}'.` });
  } else{
    return res.status(400).json({ error: 'Niepoprawna wartość visibility. Dozwolone: private, public.' });
  }
});

app.get('/info/:id',isAuthenticated, async (req, res) => {
    const { id } = req.params;
    req.session.id = id;
    const file = await getFileData(id);
    res.render('info', { ...file });
});

app.get('/comments/:id',isAuthenticated, async (req, res) => {
    const { id } = req.params;
    req.session.id = id;
    const file = await getFileData(id);
    res.render('comments', { ...file });
});

app.get('/delete/:id?',isAuthenticated, async (req, res) => {
    const { id } = req.params;
    await deleteFileDate(req.session.username,id)
    res.redirect('/filemanager');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = getUser(username);
  if (!user)
    return res.render('login', { message: 'Nieprawidłowy login lub hasło.' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    return res.render('login', { message: 'Nieprawidłowy login lub hasło.' });

  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/');
});

app.post('/add_acl/:id',isAuthenticated, async (req, res) => {
  const { username } = req.body;
  const { id } = req.params;
  await assignUserToFile(req.session.username,username,id);
    res.redirect('/filemanager');
});

app.post('/comment/:id',isAuthenticated, async (req, res) => {
  const { comment } = req.body;
  const { id } = req.params;
  
  addComment(id,req.session.username ,comment)

  res.redirect('/filemanager');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (userExists(username))
    return res.render('login', { message: 'Użytkownik istnieje.' });

  await addUser(username,password)

  const user = getUser(username);
  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/');
});

  
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/');
}

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
