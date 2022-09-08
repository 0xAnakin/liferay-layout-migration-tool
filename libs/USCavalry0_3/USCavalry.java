package com.revusky.util;

import org.apache.velocity.runtime.*;
import java.io.*;

public class USCavalry {
    static public void main(String[] args) {
        String from = null;
        String to = null;
        if (args == null || args.length == 0) {
            usage();
            System.exit(-1);
        }
        from = args[0];
        if (args.length >1) {
            to = args[1];
        }
        try {
            convert (from, to);
        } 
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    static void convert(String from, String to) throws Exception {
        Writer out = null;
        FileReader reader = new FileReader(from);
        System.err.println("reading from file: " + from);
        if (to != null) {
            out = new FileWriter(to);
            System.err.println("outputting to file: " + to);
        } else {
            out = new OutputStreamWriter(System.out);
            System.err.println("Outputting to stdout");
        }
        RuntimeServices VEL = RuntimeSingleton.getRuntimeServices();
        VEL.init();
        out.write(VEL.parse(reader, from).toString());
        out.flush();
        out.close();
    }

    static void usage() {
        System.err.println("Velocity->FreeMarker conversion tool, version 0.3");
        System.err.println("This is a utility to convert files from Velocity to FreeMarker syntax.");
        System.err.println("Usage: java com.revusky.util.USCavalry <fromfile> [<tofile>]\n");
        System.err.println("This product includes software developed by the");
        System.err.println("Apache Software Foundation (http://www.apache.org/).");
    }
}


