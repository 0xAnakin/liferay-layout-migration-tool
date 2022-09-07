const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const lib = require('./lib');

console.log(`
=================================================================================
         ___      ___   _______  _______  ______    _______  __   __ 
        |   |    |   | |       ||       ||    _ |  |   _   ||  | |  |
        |   |    |   | |    ___||    ___||   | ||  |  |_|  ||  |_|  |
        |   |    |   | |   |___ |   |___ |   |_||_ |       ||       |
        |   |___ |   | |    ___||    ___||    __  ||       ||_     _|
        |       ||   | |   |    |   |___ |   |  | ||   _   |  |   |  
        |_______||___| |___|    |_______||___|  |_||__| |__|  |___|   

=================================================================================

Utility for migrating liferay 6.2 layouts to 7.x.x
Version: ${pkg.version}
Usage: 

    - node src/index.js {LAYOUT_ROOT_DIR} {LAYOUT_DEST_DIR}
    - npm run migrate {LAYOUT_ROOT_DIR} {LAYOUT_DEST_DIR} {LAYOUT_XML_PATH_PREFIX}

    {LAYOUT_ROOT_DIR}       - required
    {LAYOUT_DEST_DIR}       - required
    {LAYOUT_XML_PATH_PREFIX}  - optional

=================================================================================
`);

if (process.argv.length < 4) {
    throw new Error('Invalid arguments provided');
}

let LAYOUT_ROOT_DIR;
let LAYOUT_DEST_DIR;
let LAYOUT_XML_PATH_PREFIX = process.argv.length === 5 ? process.argv[4] : '/layouttpl/custom/MYLAYOUT-layouttpl';

if (path.isAbsolute(process.argv[2])) {
    LAYOUT_ROOT_DIR = process.argv[2];
} else {
    LAYOUT_ROOT_DIR = path.join(__dirname, process.argv[2]);
}

if (path.isAbsolute(process.argv[3])) {
    LAYOUT_DEST_DIR = process.argv[3];
} else {
    LAYOUT_DEST_DIR = path.join(__dirname, process.argv[3]);
}

const LAYOUTS_DIRECTORY = path.join(LAYOUT_ROOT_DIR, 'src/main/webapp');
const LAYOUTS_XML = path.join(LAYOUTS_DIRECTORY, 'WEB-INF/liferay-layout-templates.xml');

/**
 * Make sure required paths are valid
 */

if (!fs.existsSync(LAYOUTS_DIRECTORY)) {
    throw new Error(`'${LAYOUTS_DIRECTORY}' does not exist!`);
}

if (!fs.existsSync(LAYOUTS_XML)) {
    throw new Error(`'${LAYOUTS_XML}' does not exist!`);
}

/**
 * Delete old LAYOUT_DEST_DIR if exists & create new directories
 */

if (fs.existsSync(LAYOUT_DEST_DIR)) {
    lib.deleteFolderRecursive(LAYOUT_DEST_DIR);
}

fs.mkdirSync(LAYOUT_DEST_DIR, {
    recursive: true
});

fs.mkdirSync(path.join(LAYOUT_DEST_DIR, 'WEB-INF'), {
    recursive: true
});

if (LAYOUT_XML_PATH_PREFIX.length) {
    fs.mkdirSync(path.join(LAYOUT_DEST_DIR, LAYOUT_XML_PATH_PREFIX), {
        recursive: true
    });
}

/**
 * Parse xml file
 */

xml2js.parseString(fs.readFileSync(LAYOUTS_XML), {
    trim: true
}, (err, result) => {

    if (err) {
        throw err;
    } else {

        /**
         * ==============================================================================
         */

        const migrated_xml = [lib.XML_HEADER, '<layout-templates>', '\t<custom>'];
        const layout_entries_arr = result['layout-templates'].custom[0]['layout-template'];

        console.log('Starting migration process...');
        console.time('Migration ended after');
        // console.debug(layout_entries_arr);

        layout_entries_arr.forEach((layout_entry, idx) => {

            const {
                id,
                name
            } = layout_entry.$;

            // console.debug(layout_entry);

            const png_file = layout_entry['thumbnail-path'][0].substring(1);
            const tpl_file = layout_entry['template-path'][0].substring(1);
            const ftl_file = tpl_file.replace('.tpl', '.ftl');

            const png_file_path = path.join(LAYOUTS_DIRECTORY, png_file);
            const tpl_file_path = path.join(LAYOUTS_DIRECTORY, tpl_file);

            console.log(`Processing ${(idx+1).toString().padStart(layout_entries_arr.length.toString().length, '0')}/${layout_entries_arr.length} template named '${name}'`);
            console.log('');
            console.log(`- id: ${id}`);
            console.log(`- png: ${png_file_path}`);
            console.log(`- tpl: ${tpl_file_path}`);
            console.log('');

            if (!fs.existsSync(png_file_path)) {
                throw new Error(`${png_file_path} does not exist!`);
            }

            if (!fs.existsSync(tpl_file_path)) {
                throw new Error(`${tpl_file_path} does not exist!`);
            }

            const original_template_source = fs.readFileSync(tpl_file_path, {
                encoding: 'utf8'
            });

            let migrated_template_source = original_template_source
                .replace(new RegExp('\\$processor\\.', 'g'), '${processor.')
                .replace(new RegExp('"\\)', 'g'), '")}')
                .replace(new RegExp('col-xs-', 'g'), 'col-');

            const $ = cheerio.load(migrated_template_source);

            $('.row-fluid').removeClass('row-fluid').addClass('row');
            $('.pull-left').removeClass('pull-left').addClass('float-left');
            $('.pull-right').removeClass('pull-right').addClass('float-right');

            $('.hidden-xs').each(function () {

                const $this = $(this);

                $this.removeClass('hidden-xs');

                if ($this.attr('class').includes('col-')) {
                    $this.addClass('d-none').addClass('d-sm-flex');
                } else {
                    $this.addClass('d-none').addClass('d-sm-block');
                }

            });

            fs.writeFileSync(path.join(LAYOUT_DEST_DIR, LAYOUT_XML_PATH_PREFIX, ftl_file), $('body').html(), {
                encoding: 'utf8'
            });

            fs.copyFileSync(png_file_path, path.join(LAYOUT_DEST_DIR, LAYOUT_XML_PATH_PREFIX, png_file));

            migrated_xml.push(`\t\t<layout-template id="${id}" name="${name}">`);
            migrated_xml.push(`\t\t\t<template-path>${path.join(LAYOUT_XML_PATH_PREFIX, ftl_file).replace(new RegExp('\\\\','g'),'/')}</template-path>`);
            migrated_xml.push(`\t\t\t<thumbnail-path>${path.join(LAYOUT_XML_PATH_PREFIX, png_file).replace(new RegExp('\\\\','g'),'/')}</thumbnail-path>`);
            migrated_xml.push('\t\t</layout-template>');

        });

        migrated_xml.push('\t</custom>');
        migrated_xml.push('</layout-templates>');

        fs.writeFileSync(path.join(LAYOUT_DEST_DIR, 'WEB-INF/liferay-layout-templates.xml'), migrated_xml.join('\n'), {
            encoding: 'utf8'
        });

        console.timeEnd('Migration ended after');

        /**
         * ==============================================================================
         */

    }

});