import { socketServer } from "./../app";
import { UploadCalculation } from "./../services/UploadCalculation";
import { Request, Response, Router } from "express";
import { singleton } from "tsyringe";
import fs from "fs/promises";
import { Queue } from "../services/Queue";
import { CalculationModel } from "../models/Calculation";

type CalculationData = {
  title: string;
  result: number;
  id: string;
  file: string;
  index: number;
};

@singleton()
export class CalculationController {
  private readonly router: Router;

  constructor(
    private readonly quque: Queue,
    private readonly uploadCalculation: UploadCalculation
  ) {
    this.router = Router();
  }

  routes(): Router {
    this.router.get("/", async (req: Request, res: Response) => {
      try {
        const calcualtions = await CalculationModel.find();

        const calculationsWithFile: Promise<CalculationData>[] =
          calcualtions.map(async (calculation) => {
            return {
              title: calculation.title,
              result: calculation.result,
              id: calculation._id.toString(),
              index: calculation.index,
              file: await fs.readFile(calculation.fileUri, {
                encoding: "utf-8",
              }),
            };
          });

        const calculationData: CalculationData[] = await Promise.all(
          calculationsWithFile
        );
        res.status(200).json({ data: calculationData });
      } catch (error) {
        throw error;
      }
    });
    this.router.post(
      "/",
      this.uploadCalculation.uploadSingle("calculation"),
      async (req: Request, res: Response) => {
        try {
          {
            const calculationData = await fs.readFile(req.file.path);
            this.quque.enque({
              title: req.body.title,
              fileUri: req.file.path,
              equation: calculationData.toString(),
            });
          }

          setInterval(() => {
            if (this.quque.isEmpty()) return;
            else {
              const calcualtion = this.quque.dequeue();
              const result = eval(calcualtion.equation);

              setTimeout(async () => {
                const newCalculation = await CalculationModel.create({
                  title: calcualtion.title,
                  fileUri: calcualtion.fileUri,
                  equation: calcualtion.equation,
                  result: result,
                  index: 0,
                });

                const calculationData: CalculationData = {
                  title: calcualtion.title,
                  result: result,
                  id: newCalculation._id.toString(),
                  file: await fs.readFile(calcualtion.fileUri, {
                    encoding: "utf-8",
                  }),
                  index: newCalculation.index,
                };

                console.log(calculationData);

                socketServer.io.emit("result", calculationData);
              }, 15 * 1000);
            }
          }, 6 * 1000);

          res.status(201).json({
            status: "success",
            message:
              "Your calculation has been successfully queued. Do not close this tab or refresh this page.",
          });
        } catch (error) {
          throw error;
        }
      }
    );
    return this.router;
  }
}
