const pkg = require('../package.json');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const xml2js = require('xml2js');
const prompts = require('prompts');
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

=================================================================================
`);

(async () => {

    const USER_INPUT = await prompts(lib.PROMPT_QUESTIONS);

    // console.debug(USER_INPUT);

    const {
        LAYOUTS_DIRECTORY,
        LAYOUTS_XML,
        LAYOUTS_XML_PATH_PREFIX,
        LAYOUTS_DEST_DIR,
        CONVERT_VELOCITY
    } = USER_INPUT;

    const TEMP_DIR = path.join(__dirname, '../temp');

    /**
     * Make sure required paths are valid
     */

    if (!fs.existsSync(LAYOUTS_DIRECTORY)) {
        throw new Error(`'${LAYOUTS_DIRECTORY}' does not exist!`);
    }

    if (!fs.existsSync(path.join(LAYOUTS_XML, 'liferay-layout-templates.xml'))) {
        throw new Error(`'${path.join(LAYOUTS_XML,'liferay-layout-templates.xml')}' does not exist!`);
    }

    /**
     * Delete old LAYOUTS_DEST_DIR if exists & create new directories
     */

    if (fs.existsSync(LAYOUTS_DEST_DIR)) {
        lib.deleteFolderRecursive(LAYOUTS_DEST_DIR);
    }

    if (fs.existsSync(TEMP_DIR)) {
        lib.deleteFolderRecursive(TEMP_DIR);
    }

    fs.mkdirSync(TEMP_DIR, {
        recursive: true
    });

    fs.mkdirSync(LAYOUTS_DEST_DIR, {
        recursive: true
    });

    fs.mkdirSync(path.join(LAYOUTS_DEST_DIR, 'WEB-INF'), {
        recursive: true
    });

    if (LAYOUTS_XML_PATH_PREFIX.length) {
        fs.mkdirSync(path.join(LAYOUTS_DEST_DIR, LAYOUTS_XML_PATH_PREFIX), {
            recursive: true
        });
    }

    /**
     * Parse xml file
     */

    xml2js.parseString(fs.readFileSync(path.join(LAYOUTS_XML, 'liferay-layout-templates.xml')), {
        trim: true
    }, async (err, result) => {

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

            for (const [idx, layout_entry] of layout_entries_arr.entries()) {

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

                let migrated_template_source = original_template_source.replace(new RegExp('col-xs-', 'g'), 'col-');

                const $ = cheerio.load(migrated_template_source);
                
                const $head_scripts = $('head script');
                const $head_styles = $('head style');

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

                if (CONVERT_VELOCITY) {

                    fs.writeFileSync(path.join(TEMP_DIR, 'velocity.tmp'), $('body').html(), {
                        encoding: 'utf8'
                    });

                    const {
                        stdout,
                        stderr
                    } = await exec(`java -jar ${path.join(__dirname, '../libs/USCavalry0_3/cavalry.jar')} ${path.join(TEMP_DIR, 'velocity.tmp')}`)

                    if (!stdout.trim().length) {

                        console.error(stderr);

                        process.exit(1);

                    }

                    migrated_template_source = stdout;

                }

                if ($head_scripts.length) {
                    
                    const $temp_wrapper = $('<div></div>')

                    $temp_wrapper.append($head_scripts.clone());

                    migrated_template_source = `${$temp_wrapper.html().trim()}\n${migrated_template_source}`;

                }    

                if ($head_styles.length) {
                    
                    const $temp_wrapper = $('<div></div>')

                    $temp_wrapper.append($head_styles.clone());

                    migrated_template_source = `${$temp_wrapper.html().trim()}\n${migrated_template_source}`;

                }                

                fs.writeFileSync(path.join(LAYOUTS_DEST_DIR, LAYOUTS_XML_PATH_PREFIX, ftl_file), migrated_template_source, {
                    encoding: 'utf8'
                });

                fs.copyFileSync(png_file_path, path.join(LAYOUTS_DEST_DIR, LAYOUTS_XML_PATH_PREFIX, png_file));

                migrated_xml.push(`\t\t<layout-template id="${id}" name="${name}">`);
                migrated_xml.push(`\t\t\t<template-path>${path.join(LAYOUTS_XML_PATH_PREFIX, ftl_file).replace(new RegExp('\\\\','g'),'/')}</template-path>`);
                migrated_xml.push(`\t\t\t<thumbnail-path>${path.join(LAYOUTS_XML_PATH_PREFIX, png_file).replace(new RegExp('\\\\','g'),'/')}</thumbnail-path>`);
                migrated_xml.push('\t\t</layout-template>');

            }

            migrated_xml.push('\t</custom>');
            migrated_xml.push('</layout-templates>');

            fs.writeFileSync(path.join(LAYOUTS_DEST_DIR, 'WEB-INF/liferay-layout-templates.xml'), migrated_xml.join('\n'), {
                encoding: 'utf8'
            });

            if (fs.existsSync(TEMP_DIR)) {
                lib.deleteFolderRecursive(TEMP_DIR);
            }

            console.timeEnd('Migration ended after');

            /**
             * ==============================================================================
             */

        }

    });

})();