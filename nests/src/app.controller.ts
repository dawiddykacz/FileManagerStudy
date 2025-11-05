import { Controller, Get, Render, UseGuards,Res, Req,Post, Param, UploadedFiles, UseInterceptors  } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Request, Response  } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname, join } from 'path';
import * as path from 'path';
import { IncomingForm } from 'formidable';

const  {addFileData, getFileData, getFilesData, updateFileVisibility, deleteFileDate,assignUserToFile,addComment,updateFileData} = require("./legacy/data/data")

@Controller()
export class AppController {
  @Get('/')
  @UseGuards(JwtAuthGuard)
  @Render('index')
  home(@Req() req: Request) {
    return { title: 'Witaj w aplikacji', user: req.user };
  }
  @Get('/upload')
  @UseGuards(JwtAuthGuard)
  @Render('upload')
  upload(@Req() req: Request) {
    return { };
  }
  @Get('/filemanager')
  @UseGuards(JwtAuthGuard)
  @Render('filemanager')
  async fileManager(@Req() req: Request) {
    const username = (req.user as any)?.username || 'unknown';
    const files = await getFilesData(username)
    return { view: 'filemanager', files };
  }

  @Post('/upload')
  @UseGuards(JwtAuthGuard)
  async uploadFile(@Req() req: Request, @Res() res: Response) {
    const uploadDir = path.join(__dirname, '..', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      multiples: true,
    });

    await new Promise<void>((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Form parse error:', err);
          reject(err);
          return;
        }

        try {
          const uploadedFiles = Array.isArray(files.file)
            ? files.file
            : [files.file];

          const username = (req.user as any)?.username || 'unknown';

          for (const f of uploadedFiles) {
            await addFileData(username, f);
          }

          resolve();
        } catch (error) {
          console.error('Upload failed:', error);
          reject(error);
        }
      });
    });

    return res.redirect('/upload');
  }

  @Post('/filemanager/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, '..', '..', 'uploads');
          if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFiles(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const username = req.user.username;
    for (const file of files) {
      await updateFileData(username,file,id)
    }
    return { message: 'Files uploaded successfully' };
  }
}
