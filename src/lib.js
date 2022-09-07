const fs = require('fs');
const path = require('path');

const XML_HEADER = `<?xml version="1.0"?>\n<!DOCTYPE layout-templates PUBLIC "-//Liferay//DTD Layout Templates 7.4.0//EN" "http://www.liferay.com/dtd/liferay-layout-templates_7_4_0.dtd">`;

const deleteFolderRecursive = (directoryPath) => {

    fs.readdirSync(directoryPath).forEach((file, index) => {

        const curPath = path.join(directoryPath, file);

        if (fs.lstatSync(curPath).isDirectory()) {
            // recurse
            deleteFolderRecursive(curPath);
        } else {
            // delete file
            fs.unlinkSync(curPath);
        }

    });

    fs.rmdirSync(directoryPath);

}

exports.XML_HEADER = XML_HEADER;
exports.deleteFolderRecursive = deleteFolderRecursive;