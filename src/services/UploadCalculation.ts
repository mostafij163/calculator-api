import { Request } from "express";
import multer, {
  Multer,
  diskStorage,
  StorageEngine,
  FileFilterCallback,
} from "multer";
import path from "path";

export class UploadCalculation {
  private upload: Multer;

  constructor() {
    this.upload = multer({
      storage: this.storage(),
      fileFilter: this.fileFilter,
    });
  }

  private storage(): StorageEngine {
    return diskStorage({
      destination: (_req: Request, _file, cb) => {
        cb(null, path.join(__dirname, "./../calc-files"));
      },
      filename: (_req: Request, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = `${uniqueSuffix}-${file.originalname}`;

        cb(null, fileName);
      },
    });
  }

  private fileFilter(
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) {
    if (file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }

  uploadSingle(fieldName: string) {
    return this.upload.single(fieldName);
  }
}
