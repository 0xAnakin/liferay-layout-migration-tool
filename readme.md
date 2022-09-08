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

Navigate at the tools root directory and ente one of the following:

```
    - node src/index.js
    - npm run migrate
```

Directory structure:

```
    |
    |__liferay-layout-migration-tool
    |__MYLAYOUT-layouttpl
```

`npm run migrate ../../MYLAYOUT-layouttpl ../../migrated /layouttpl/custom/MYLAYOUT-layouttpl`