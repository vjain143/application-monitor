package se.voipbusiness.core;

import java.io.*;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;


/**
 * Created by espinraf on 19/05/15.
 */
public class MonitorHttpServer {


    public  void init() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        server.createContext("/monitor", new MyHandler());
        server.setExecutor(null); // creates a default executor
        server.start();
    }

    static class MyHandler implements HttpHandler {


        public void handle(HttpExchange t) throws IOException {
            String path = t.getRequestURI().getPath();
            path = "/wwwroot/" + path.replace("/monitor/", "");
            System.out.println("PATH: " + path);
            String response;

            System.out.println("Calling JAR: ");

            response = readFromJARFile(path);

            if(response != null){
                t.sendResponseHeaders(200, response.length());
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
            else {
                response = "404 NOT FOUND";
                t.sendResponseHeaders(404, response.length());
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }

        }

/*
        public void handle(HttpExchange t) throws IOException {
            String path = t.getRequestURI().getPath();
            path = "wwwroot/" + path.replace("/monitor/", "");
            System.out.println("PATH: " + path);

            ClassLoader classLoader = getClass().getClassLoader();
            File file = new File(classLoader.getResource(path).getFile());
            //File file = new File(path);
            System.out.println("FILE: " + file.toURI());



            if (!file.isFile()) {
            //if(1 == 3){
                // Object does not exist or is not a file: reject with 404 error.
                String response = "404 (Not Found)\n";
                t.sendResponseHeaders(404, response.length());
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
            } else {
                // Object exists and is a file: accept with response code 200.
                String mime = "text/html";
                if(path.substring(path.length()-3).equals(".js")) mime = "application/javascript";
                if(path.substring(path.length()-3).equals("css")) mime = "text/css";

                Headers h = t.getResponseHeaders();
                h.set("Content-Type", mime);
                t.sendResponseHeaders(200, 0);

                OutputStream os = t.getResponseBody();
                FileInputStream fs = new FileInputStream(file);
                final byte[] buffer = new byte[0x10000];
                int count = 0;
                while ((count = fs.read(buffer)) >= 0) {
                    os.write(buffer,0,count);
                }
                fs.close();
                os.close();
            }
        }
*/
        public String readFromJARFile(String filename)

        {
            InputStream is = MyHandler.class.getResourceAsStream(filename);
            InputStreamReader isr = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(isr);
            StringBuffer sb = new StringBuffer();
            String line;
            try {
                while ((line = br.readLine()) != null)
                {
                    sb.append(line + "\n");
                }

            br.close();
            isr.close();
            is.close();

            } catch (IOException e) {
                e.printStackTrace();
            }
            return sb.toString();
        }

    }



}