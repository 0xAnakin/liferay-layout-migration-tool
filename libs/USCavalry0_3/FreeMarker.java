/*
 * FreeMarker: a tool that allows Java programs to use templates
 * to generate HTML or other text output that contains dynamic content.
 * Copyright (C) 1998,2002 Benjamin Geer
 * Email: beroul@users.sourceforge.net
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 * 
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * Neither the name "Freemarker" nor any of the names of the project 
 * contributors may be used to endorse or promote products 
 * derived from this software without specific prior written permission.

 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package com.revusky.util;

import java.io.*;
import org.apache.velocity.context.Context;
import freemarker.template.*;

/**
 * A holder for some convenience routines for 
 * people upgrading from Velocity to FreeMarker
 * @author <a href="mailto:jon@revusky.com>Jonathan Revusky</a>
 * @version $Id:
 */
abstract public class FreeMarker
{
    /**
     * A familiar API from Velocity. It takes the 
     * same parameters as the Velocity.mergeTemplate() routine.
     * @param templateName The lookup name for the template.
     * @param encoding the encoding to use when reading in the template
     * @return true on success, or false on failure. In the
     * case of failure, a message is logged.
     */
    static public boolean mergeTemplate(String templateName, 
                                        String encoding, 
                                        Context vctxt,
                                        Writer writer) 
    {
        Configuration fmConfig = Configuration.getDefaultConfiguration();
        Template fmTemplate = null;
        try {
            fmTemplate = fmConfig.getTemplate(templateName, encoding);
            processVelocityContext(fmTemplate, vctxt, writer);
            return true;
        } catch (Exception e) {
            logException(e);
            return false;
        }
    }

    /**
     * A routine that renders a FreeMarker template to a
     * character stream using the data in a Velocity Context object.
     */
    static public void processVelocityContext(Template fmTemplate, 
                                              Context vctxt, 
                                              Writer out) 
    throws TemplateException, IOException 
    {
        TemplateHashModel root = convertVelocityContext(vctxt);
        fmTemplate.process(root, out);
    }

    /**
     * converts a Velocity Context into a FreeMarker TemplateHashModel.
     * @param vctxt the Velocity Context object
     * @return a TemplateHashModel containing the key/value pairs in the 
     * Velocity Context
     */
    static public TemplateHashModel convertVelocityContext(Context vctxt) {
        SimpleHash result = new SimpleHash(ObjectWrapper.BEANS_WRAPPER);
        Object[] keys = vctxt.getKeys();
        for (int i = 0; i < keys.length; i++) {
            String key = keys[i].toString();
            result.put(key, vctxt.get(key));
        }
        return result;
    }

    static public void logException(Exception e) {
        // Does nothing, put something here if you want.
    }
}
