package se.voipbusiness.core;

import com.eclipsesource.json.JsonObject;
import com.eclipsesource.json.JsonArray;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.net.UnknownHostException;

/**
 * Created by espinraf on 18/05/15.
 *
 * Main calss which starts Monitor Server
 */
public class Main {

    public static void main(String[] args) throws IOException, InterruptedException {

        // Read Configuration
        String jFile;
        BufferedReader br = new BufferedReader(new FileReader("config/app-monitor.json"));
        try {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            jFile = sb.toString();
        } finally {
            br.close();
        }

        JsonArray jo = JsonArray.readFrom(jFile);
        System.out.println(jo);

        // UDP Server, this could be replace with a TCP Server
        MonitorUDPServer s = new MonitorUDPServer();
        s.start();

        // Log4j2 UDP Server, this could be replace with a TCP Server
        MonitorLog4J2UdpServer l = new MonitorLog4J2UdpServer();
        l.start();

        // Websocket server, https://github.com/TooTallNate/Java-WebSocket
        MonitorWebSocket ws = null;
        try {
            ws = new MonitorWebSocket(9099);
            ws.startDebug();
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }

        // Http Server, native in JDK7
        MonitorHttpServer ht = new MonitorHttpServer();
        try {
            //Set config
            ht.ja = jo;
            ht.init();
        } catch (Exception e) {
            e.printStackTrace();
        }

        // DB implementation using MapDB. http://mapdb.org
        // the implementation is in-memory sa far.
        MonitorDB mdb = new MonitorDB();
        mdb.init();

        // This class orchestate all server mentioned above.
        Monitor mon = new Monitor();
        mon.init(ws, s, mdb);
        s.mon = mon;
        l.mon = mon;
        ws.mon = mon;

        //Intilize Crons to reset counters
        MonitorTTL ttl = new MonitorTTL();
        ttl.mon = mon;
        ttl.init();

        //Initialize Ping (Heartbeat)
        MonitorPing mp = new MonitorPing();
        mp.mon = mon;
        mon.mp = mp;


    }
}
