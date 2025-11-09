import { Controller, Get, Render, UseGuards,Res, Body, Req,Post, Param, NotFoundException, UploadedFiles, UseInterceptors  } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Request, Response  } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname, join } from 'path';
import * as path from 'path';
import { IncomingForm } from 'formidable';

const {getPresignedUrl} = require("./legacy/data/fileStorage")
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

  @Get('/history/:id')
  @UseGuards(JwtAuthGuard)
  @Render('versions')
  async history(@Param('id') id: string) {
    const file = await getFileData(id);

    if (!file || !file.versions) {
      throw new NotFoundException("Cannot find file")
    }

    return { view: 'versions',
      name: file.name,
      versions: file.versions,
      ownerName: file.ownerName,};
  }

  @Get('/info/:id')
  @UseGuards(JwtAuthGuard)
  @Render('info')
  async getFileInfo(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const file = await getFileData(id);

    if (!file) {
    throw new NotFoundException("Cannot find file")
    }

    return {
      ...file
    };
  }
  @Get('/comments/:id')
  @UseGuards(JwtAuthGuard)
  @Render('comments')
  async comments(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const file = await getFileData(id);

    if (!file) {
    throw new NotFoundException("Cannot find file")
    }

    return {
      ...file
    };
  }

  @Get('/delete/:id')
  @UseGuards(JwtAuthGuard)
  @Render('filemanager')
  async deleteFile(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const username = (req.user as any)?.username || 'unknown';
    await deleteFileDate(username,id);
    const files = await getFilesData(username)
    return { view: 'filemanager', files };
  }

  @Post('/files/:id/visibility')
  @UseGuards(JwtAuthGuard)
  async updateVisibility(
    @Param('id') id: string,
    @Body('visibility') visibility: string,
  ) {
    if (!['private', 'public'].includes(visibility)) {
      throw new Error("Niepoprawna wartość visibility. Dozwolone: private, public.',");
    }

    await updateFileVisibility(id, visibility);
    return {
      message: `Visibility pliku zaktualizowana na '${visibility}'.`,
    };
  }
   
  
  @Post('/add_acl/:id')
  @UseGuards(JwtAuthGuard)
  async addAcl(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body('username') username: string,
  ) {
      const currentUser = (req.user as any)?.username;

      if (!currentUser || !username) {
        throw new NotFoundException("Error")
      }

      await assignUserToFile(currentUser, username, id);
      return {message: "ok"}
  }

  @Post('/comment/:id')
  @UseGuards(JwtAuthGuard)
  async addCommentToFile(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body('comment') comment: string,
  ) {
    const username = (req.user as any)?.username;

    if (!username || !comment) {
      throw new NotFoundException("Error")
    }

    await addComment(id, username, comment);
    return {message: "ok"}
  }


  @Get('/files/:id')
  @UseGuards(JwtAuthGuard)
  @Render('preview')
  async viewFile(@Param('id') id: string) {
    
    const fi = await getFileData(id);

    if (!fi) {
      throw new NotFoundException("Cannot find file")
    }

    const { name, file, version, ownerName } = fi;

    if (!file || !name) {
      throw new NotFoundException("Cannot find file")
    }

    const url = await getPresignedUrl(`${id}v${version}`);

    return { view: 'preview', 
      title: 'Podgląd pliku',
      url,
      version,
      name,
      contentType: file.ContentType || 'application/octet-stream',
      ownerName, };
  }

  @Post('/filemanager/:id')
  @UseGuards(JwtAuthGuard)
  async uploadNewVersion(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const uploadDir = join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const form =  new IncomingForm({
      uploadDir,
      keepExtensions: true,
      multiples: true,
    });

    form.on('fileBegin', (name, file) => {
      const safeName =
        file.originalFilename || (file as any).newFilename || (file as any).name;
      file.filepath = join(uploadDir, safeName);
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).send('Upload error');
      }

      const uploadedFiles: File[] = Array.isArray((files as any).file)
        ? (files as any).file
        : [(files as any).file];

      try {
        const username = (req.user as any)?.username;
        if (!username) return res.status(401).send('Unauthorized');

        for (const f of uploadedFiles) {
          await updateFileData(username, f, id);
        }

        return res.redirect('/');
      } catch (error) {
        console.error('Update failed:', error);
        return res.status(500).send('Error while updating file');
      }
    });
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
}
