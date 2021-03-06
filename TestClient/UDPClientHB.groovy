import java.lang.management.ManagementFactory
import java.util.timer.*

class TimerTaskExample extends TimerTask {
    def DatagramSocket socC
    def addrC = InetAddress.getByName("localhost")
    def portC = 9090
    def data1 = ""

    public TimerTaskExample(DatagramSocket soc, String msg){
        socC = soc
        data1 = msg
    }
    public void run() {
        println "Sending Hearbeat... ${data1}"
        def data = data1.bytes
        def packet = new DatagramPacket(data, data.length, addrC, portC)
        socC.send(packet)
    }
}

runtime = Runtime.getRuntime()
jvmVer = System.getProperty("java.version")

addr = InetAddress.getByName("localhost")
port = 9090

//def rn = java.util.Random();
def socket = new DatagramSocket()

int delay = 10000   // delay for 5 sec.
int period = 50000  // repeat every sec.
Timer timer = new Timer()
def msgT = """ {"AppId" : "app-001", "AppName" : "UDPClientHB.groovy", "ttw": "60000" }  """
timer.scheduleAtFixedRate(new TimerTaskExample(socket, msgT), delay, period)
msgT = """ {"AppId" : "app-002", "AppName" : "Fake_app", "ttw": "120000" }  """
timer.scheduleAtFixedRate(new TimerTaskExample(socket, msgT), delay, 110000)


def rannum = 1;
def rannum2 = 2;
while (true){
    def username = System.console().readLine 'Enter to send Data'

    println "Sending data.......... "

    for (int i = 0 ; i < 10 ; i++) {
        maxmem = (runtime.maxMemory())/1024
        allocmem = (runtime.totalMemory())/1024
        freemem = (runtime.freeMemory())/1024
        pid = ManagementFactory.getRuntimeMXBean().getName()
        rannum = Math.abs(new Random().nextInt()) % 20 + 1
        data1 = """
{
"Id" : "i01${i + 1}",
"Name" : "Customer",
"Type" : "JMS",
"Status" : "OK",
"Role" : "admin",

"data":
[
{ "name" : "msgRecv", "value" : "1", "type" : "T" },
{ "name": "msgSend", "value" : "5", "type" : "C" , "ttl" : "1h"},
{ "name": "Errors", "value" : "${rannum}", "type" : "V" },
{ "name": "ErrorXSLT", "value" : "true", "type" : "B" },
{ "name": "LastError", "value" : "NO ERRORS", "type" : "S" },
{ "name": "Java Version", "value" : "${jvmVer}", "type" : "S" },
{ "name": "MaxMemKB", "value" : "${maxmem}", "type" : "V" },
{ "name": "AllocmemKB", "value" : "${allocmem}", "type" : "V" },
{ "name": "FreeMemKB", "value" : "${freemem}", "type" : "V" },
{ "name": "PID", "value" : "${pid}", "type" : "S" }
]
}
"""
        data = data1.bytes
        packet = new DatagramPacket(data, data.length, addr, port)
        socket.send(packet)
        rannum2 = Math.abs(new Random().nextInt()) % 4 + 1
        data2 = """
{
"Id" : "i02${i + 1}",
"Name" : "BankID",
"Type" : "WS",
"Status" : "OK",

"data":
[
{ "name" : "msgRecv", "value" : "${rannum}", "type" : "SR" },
{ "name": "msgSend", "value" : "${rannum2}", "type" : "FR" },
{ "name": "Errors", "value" : "${rannum2}", "type" : "V" },
{ "name": "ErrorXSLT", "value" : "false", "type" : "B" },
{ "name": "LastError", "value" : "Time Out", "type" : "S" }
]
}
"""
        data = data2.bytes
        packet = new DatagramPacket(data, data.length, addr, port)
        socket.send(packet)
    }

    data3 = """
{
"Id" : "i0200",
"Name" : "SR",
"Type" : "WS",
"Status" : "OK",

"data":
[
{ "name" : "msgRecv", "value" : "5", "type" : "SR" },
{ "name": "msgSend", "value" : "1000", "type" : "S" },
{ "name": "Errors", "value" : "1", "type" : "S" },
{ "name": "ErrorXSLT", "value" : "false", "type" : "B" },
{ "name": "LastError", "value" : "Time Out", "type" : "S" }
]
}
"""
    data = data3.bytes
    packet = new DatagramPacket(data, data.length, addr, port)
    socket.send(packet)

    data4 = """
{
"Id" : "i0201",
"Name" : "FR",
"Type" : "WS",
"Status" : "OK",

"data":
[
{ "name" : "msgRecv", "value" : "5", "type" : "FR" },
{ "name": "msgSend", "value" : "1000", "type" : "S" },
{ "name": "Errors", "value" : "1", "type" : "S" },
{ "name": "ErrorXSLT", "value" : "false", "type" : "B" },
{ "name": "LastError", "value" : "Time Out", "type" : "S" }
]
}
"""
    data = data4.bytes
    packet = new DatagramPacket(data, data.length, addr, port)
    socket.send(packet)

}
