import { CaseListing } from "./schemaTypes";
import { randInt } from "./randomizers";
import { readFile } from "fs";

const editFile = "outputs/cases.csv";

readCSV(editFile, (data) => {
    console.log(data);
});


//
//  HELPER FUNCTIONS
//

function readCSV(filePath: string, callback: (data: string) => void) {
    readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`An error occured trying to read ${filePath}:`, err);
            return;
        } else if (!data) {
            console.log("No data.");
            return;
        }

        callback(data);
    });
}

