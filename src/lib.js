const fs = require('fs');
const path = require('path');

const XML_HEADER = `<?xml version="1.0"?>\n<!DOCTYPE layout-templates PUBLIC "-//Liferay//DTD Layout Templates 7.4.0//EN" "http://www.liferay.com/dtd/liferay-layout-templates_7_4_0.dtd">`;

const PROMPT_QUESTIONS = [{
        type: 'text',
        name: 'LAYOUTS_DIRECTORY',
        message: 'Where are your tpl & png files located?',
        initial: 'E:/Development/lab/javascript/liferay-layout-migration-tool/OTETV-layouttpl/src/main/webapp'
    },
    {
        type: 'text',
        name: 'LAYOUTS_XML',
        message: 'Where is your liferay-layout-templates.xml located?',
        initial: 'E:/Development/lab/javascript/liferay-layout-migration-tool/OTETV-layouttpl/src/main/webapp/WEB-INF'
    },
    {
        type: 'text',
        name: 'LAYOUTS_XML_PATH_PREFIX',
        message: 'Add a path prefix for layout resources.',
        initial: '/layouts'
    },
    {
        type: 'text',
        name: 'LAYOUTS_DEST_DIR',
        message: 'Enter migration export path.',
        initial: 'migrated'
    },
    {
        type: 'select',
        name: 'CONVERT_VELOCITY',
        message: 'Convert velocity to freemarker?',
        choices: [{
                title: 'Yes',
                value: true,
            },
            {
                title: 'No',
                value: false
            }
        ],
        initial: 1
    }
];

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
exports.PROMPT_QUESTIONS = PROMPT_QUESTIONS;
exports.deleteFolderRecursive = deleteFolderRecursive;