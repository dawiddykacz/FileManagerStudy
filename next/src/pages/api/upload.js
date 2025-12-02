
import { IncomingForm } from 'formidable';
import { join } from 'path';
import fs from "fs";
import path from "path";
import { addFileData } from "@/lib/data/data";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  const username = req.cookies.username;
  if (!username) return res.status(401).end("Unauthorized");

  const uploadDir = join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  
      const form =  new IncomingForm({
        uploadDir,
        keepExtensions: true,
        multiples: true,
      });
  
      form.on('fileBegin', (name, file) => {
        const safeName =
          file.originalFilename || (file).newFilename || (file).name;
        file.filepath = join(uploadDir, safeName);
      });
  
      form.parse(req, async (err, fields, files) => {
        if (err) {
          throw new BadRequestException("Upload error");
        }
  
        const uploadedFiles = Array.isArray((files).file)
          ? (files).file
          : [(files).file];

    for (const f of uploadedFiles) {
      await addFileData(username, f);
    }

    res.redirect("/upload");
  });
}
