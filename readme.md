# liferay-layout-migration-tool

```
=================================================================================
         ___      ___   _______  _______  ______    _______  __   __ 
        |   |    |   | |       ||       ||    _ |  |   _   ||  | |  |
        |   |    |   | |    ___||    ___||   | ||  |  |_|  ||  |_|  |
        |   |    |   | |   |___ |   |___ |   |_||_ |       ||       |
        |   |___ |   | |    ___||    ___||    __  ||       ||_     _|
        |       ||   | |   |    |   |___ |   |  | ||   _   |  |   |  
        |_______||___| |___|    |_______||___|  |_||__| |__|  |___|   

=================================================================================
```
Utility for migrating liferay 6.2 layouts to 7.x.x

## Usage

```
    - node src/index.js {LAYOUT_ROOT_DIR} {LAYOUT_DEST_DIR}
    - npm run migrate {LAYOUT_ROOT_DIR} {LAYOUT_DEST_DIR} {LAYOUT_XML_PATH_PREFIX}

    {LAYOUT_ROOT_DIR}       - required
    {LAYOUT_DEST_DIR}       - required
    {LAYOUT_XML_PATH_PREFIX}  - optional
```

Directory structure:

```
    |
    |__liferay-layout-migration-tool
    |__MYLAYOUT-layouttpl
```

`npm run migrate ../../MYLAYOUT-layouttpl ../../migrated /layouttpl/custom/MYLAYOUT-layouttpl`