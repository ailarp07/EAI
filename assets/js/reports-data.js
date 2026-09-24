const REPORTS = {
  "raspi-vision": {
    icon: "bi-cpu",
    backAnchor: "m5",
    en: {
      eyebrow: "M.5 · Reports & Docs",
      date: "Semester 1",
      title: "Raspberry Pi Vision & GPIO Labs",
      meta: "Hand-tracking, servo control, and YOLOv8 object detection on a Raspberry Pi 4.",
      body: `
        <p>Built a progression of 15+ scripts, starting from basic LED blink and button-input GPIO tests and working up to a full computer-vision pipeline. The main project uses MediaPipe to track a hand over the webcam feed, samples the pixel color at the fingertip, matches it against a calibrated color palette, then drives an SG90 servo via PWM to the angle for the matched color. Alongside that, we trained a custom YOLOv8 model (12 object classes) and ran live object detection over the webcam, with detected class names pushed to a 16x2 I2C LCD in real time.</p>

        <h3>Equipment Used</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Component</th><th>Role</th></tr></thead>
          <tbody>
            <tr><td>Raspberry Pi 4</td><td>Main board, running Debian 13 (trixie), 64-bit</td></tr>
            <tr><td>USB webcam</td><td>Feeds <code>/dev/video0</code> for hand-tracking and YOLO</td></tr>
            <tr><td>SG90 servo motor</td><td>Driven by PWM based on the matched color</td></tr>
            <tr><td>HC-SR04 ultrasonic sensor</td><td>Distance-sensing GPIO tests</td></tr>
            <tr><td>DC motor + L298N H-bridge</td><td>Motor control GPIO tests</td></tr>
            <tr><td>16x2 I2C LCD (PCF8574)</td><td>Live readout of YOLO detections</td></tr>
            <tr><td>LEDs, push buttons, wiring</td><td>The earlier GPIO-basics scripts</td></tr>
          </tbody>
        </table></div>

        <h3>Getting the Pi Running</h3>
        <p>Before any of the vision code runs, the Pi needs an OS on the SD card and a way to actually reach it. Two ways to work with it after that: hook up a monitor directly, or run it "headless" and connect over the network - headless is what this project actually used day to day.</p>

        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Step</th><th>What to do</th></tr></thead>
          <tbody>
            <tr><td>1. Flash the SD card</td><td>Install <strong>Raspberry Pi Imager</strong> on a regular PC, pick the OS (Raspberry Pi OS, Debian-based), pick the target SD card, then open the gear/advanced-options icon <em>before</em> writing - that's where hostname, username/password, and Wi-Fi credentials get pre-set</td></tr>
            <tr><td>2. Enable SSH ahead of time</td><td>In that same advanced-options screen, tick "Enable SSH" (password auth, or paste a public key). This is what makes headless setup possible - the Pi has SSH already listening the very first time it boots, no monitor ever needed</td></tr>
            <tr><td>3. Boot &amp; find it on the network</td><td>Power the Pi on, wait for it to join Wi-Fi (or plug in Ethernet), then find its address - either check the router's device list, or just try connecting to the hostname set in step 1 directly (Raspberry Pi OS advertises itself over mDNS)</td></tr>
            <tr><td>4. First SSH connection</td><td>From a terminal on the PC: <code>ssh username@raspberrypi.local</code> (or the IP address if <code>.local</code> resolution isn't working) - accept the host key fingerprint prompt on first connect, that's normal, not a warning to ignore permanently</td></tr>
          </tbody>
        </table></div>

        <p>If <code>.local</code> resolution isn't working and the router's device list isn't handy, the Pi's own IP address can be read directly once there's any way to reach a shell on it (HDMI+keyboard, or an SSH session that's already connected some other way) with <code>ifconfig</code> (or the newer <code>ip a</code>) - look for the <code>inet</code> address under <code>wlan0</code> (Wi-Fi) or <code>eth0</code> (Ethernet). And most system-level commands on the Pi - installing packages with <code>apt</code>, running <code>raspi-config</code>, enabling I2C/SPI, editing files outside the home folder - need a <code>sudo</code> prefix, since the default user isn't root; a "Permission denied" on a command that looks otherwise correct is almost always a missing <code>sudo</code>.</p>

        <h3>SSH from the VS Code Terminal</h3>
        <p>Once the Pi answers over SSH, everything after that can happen straight from a laptop - no keyboard or monitor on the Pi itself. The plain way is just running <code>ssh username@raspberrypi.local</code> in VS Code's own integrated terminal (View &rarr; Terminal), exactly like any other terminal - it drops into a shell running on the Pi, and every command from that point executes there, not on the laptop.</p>
        <p>The more comfortable way is the <strong>Remote - SSH</strong> extension: it connects VS Code's whole window to the Pi, so the file explorer, integrated terminal, and even installed extensions all operate directly on the Pi's filesystem - editing a file saves it there directly, no separate upload/copy step needed. Once connected, the bottom-left green corner shows the remote host name as confirmation the editor is actually talking to the Pi and not the local machine.</p>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>Config file gotcha:</strong> when Remote - SSH adds a new host, it doesn't always fill in a username - it can save just a bare <code>Host raspberrypi.local</code> entry with no <code>User</code> line, which then either fails to connect or keeps prompting for a username every time. Open the SSH config directly (Remote - SSH: Open SSH Configuration File, or edit <code>~/.ssh/config</code> by hand) and add the line manually under the right host entry: <code>User pi</code> (or whatever username was set in the Raspberry Pi Imager) - once it's there, connecting is one click with no repeated prompts.</div></div>

        <h3>Editing on the Pi: vim &amp; nano</h3>
        <p>Not every edit is worth opening VS Code for, especially over a laggy connection - a quick config tweak is often faster directly in the SSH terminal with a text editor that runs inside it.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Editor</th><th>Open a file</th><th>Save &amp; quit</th></tr></thead>
          <tbody>
            <tr><td><strong>nano</strong></td><td><code>nano filename.py</code></td><td><code>Ctrl+O</code> then Enter to save, <code>Ctrl+X</code> to exit - the shortcut list is always shown at the bottom of the screen, which is why it's the friendlier default</td></tr>
            <tr><td><strong>vim</strong></td><td><code>vim filename.py</code></td><td>Press <code>i</code> to start typing (insert mode), <code>Esc</code> to stop, then type <code>:wq</code> and Enter to save and quit (or <code>:q!</code> to quit without saving) - no on-screen hints by default, which is exactly why it trips up anyone opening it for the first time not knowing how to get back out</td></tr>
          </tbody>
        </table></div>

        <h3>Direct HDMI Connection</h3>
        <p>Headless isn't always possible - debugging why the camera preview window won't show, for instance, needs an actual display. For that: a micro-HDMI to HDMI cable (Pi 4 has micro-HDMI ports, not full-size) into a monitor, plus a USB keyboard and mouse plugged in directly. This boots straight to the desktop (or a login prompt) with no network setup required at all, which also makes it the fallback when SSH itself won't connect - wrong Wi-Fi password, SSH not enabled, or the Pi never joined the network in the first place.</p>

        <h3>Setup</h3>
        <p>The repo ships an automated setup script, which is what we normally run. It checks the Python version, creates an isolated virtual environment, and installs the pinned dependencies for you:</p>
        <pre class="code-block"><code>./setup.sh</code></pre>
        <p>The equivalent manual steps, in case you need to see what it's actually doing:</p>
        <pre class="code-block"><code>pyenv install 3.11.9
pyenv local 3.11.9
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt</code></pre>

        <h3>Picking the Right Python Interpreter</h3>
        <p>Same failure mode as picking the wrong interpreter in any editor: the venv can have every package installed correctly and the code still throws <code>ModuleNotFoundError</code>, because VS Code (or whatever's running the script) is actually pointed at a <em>different</em> Python than the one <code>pip install</code> ran against. This project has exactly two Python environments in play - system Python and <code>venv/</code> - and picking the wrong one is the single most common "it works in the terminal but not when I hit Run" bug.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Check</th><th>What it confirms</th></tr></thead>
          <tbody>
            <tr><td><code>Ctrl+Shift+P</code> &rarr; <strong>Python: Select Interpreter</strong></td><td>Pick the one listed as <code>./venv/bin/python</code>, not the bare system one - VS Code shows the active interpreter in the bottom-right status bar afterward, so it's a permanent reminder, not a one-time check</td></tr>
            <tr><td><code>which python3</code> in the integrated terminal</td><td>Only meaningful <em>after</em> <code>source venv/bin/activate</code> - if the path printed doesn't end in <code>venv/bin/python3</code>, the venv isn't actually active in that terminal, regardless of what the editor's status bar claims</td></tr>
            <tr><td><code>pip list</code> vs <code>python3 -c "import cv2"</code></td><td>If <code>pip list</code> shows the package but the import still fails, the terminal running <code>pip install</code> and the one running the script are two different Python environments - re-check both of the above</td></tr>
          </tbody>
        </table></div>
        <p>The <code>venv/</code> folder itself is never committed (it's in <code>.gitignore</code> along with a leftover <code>env/</code> from early testing) - it has to be recreated locally with <code>./setup.sh</code> or the manual steps above on every fresh clone, on every machine, including a freshly re-flashed Pi.</p>

        <h3>Terminal Command Cheatsheet</h3>
        <p>The commands reached for constantly once working headless over SSH, beyond the editors above:</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Command</th><th>What it does</th></tr></thead>
          <tbody>
            <tr><td><code>ls -la</code></td><td>List everything in the current folder, including hidden dotfiles, with permissions</td></tr>
            <tr><td><code>cd path/</code> / <code>cd ..</code> / <code>cd ~</code></td><td>Move into a folder / up one level / back to the home folder</td></tr>
            <tr><td><code>pwd</code></td><td>Print the current folder's full path - useful after losing track over a long SSH session</td></tr>
            <tr><td><code>mkdir -p a/b/c</code></td><td>Create a folder (and any missing parent folders) in one shot</td></tr>
            <tr><td><code>cp -r src dst</code> / <code>mv src dst</code></td><td>Copy a folder recursively / move or rename a file or folder</td></tr>
            <tr><td><code>rm -rf folder/</code></td><td>Delete a folder and everything in it, no confirmation - no undo, double-check the path first</td></tr>
            <tr><td><code>chmod +x setup.sh</code></td><td>Mark a script executable, needed before <code>./setup.sh</code> works at all</td></tr>
            <tr><td><code>sudo systemctl status ssh</code></td><td>Check whether a background service (SSH, in this case) is actually running</td></tr>
            <tr><td><code>htop</code></td><td>Live view of CPU/RAM usage per process - the first thing to check when the Pi feels sluggish</td></tr>
            <tr><td><code>df -h</code></td><td>Disk space free per mounted drive, human-readable (GB/MB instead of raw bytes)</td></tr>
            <tr><td><code>Ctrl+C</code></td><td>Kill whatever's running in the foreground of that terminal - the standard "get me out of this"</td></tr>
          </tbody>
        </table></div>

        <h3>Problems We Faced</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Error</th><th>Root cause</th><th>Fix</th></tr></thead>
          <tbody>
            <tr><td><code>ModuleNotFoundError: cv2</code></td><td>mediapipe==0.10.9 only ships a prebuilt wheel for aarch64 on Python 3.11</td><td>Pinned Python 3.11.9 through pyenv before creating the venv</td></tr>
            <tr><td><code>qt.qpa.xcb: could not connect to display</code></td><td>No <code>DISPLAY</code> set - SSH sessions have no display by default</td><td>Prefix commands with <code>DISPLAY=:0</code>, connect via Raspberry Pi Connect / VNC</td></tr>
            <tr><td>Could not open camera device at index 0</td><td>Another process still held <code>/dev/video0</code> open</td><td>Checked <code>lsusb</code>, killed the stale process with <code>fuser /dev/video0</code></td></tr>
            <tr><td><code>externally-managed-environment</code></td><td>Debian 12+'s PEP 668 blocks system-wide pip installs</td><td>Always activate the virtual environment first</td></tr>
            <tr><td>Ambiguous color matches</td><td>Two calibrated color targets sat too close in RGB space</td><td>Widened target separation, recalibrated with (calibrate_colors.py)</td></tr>
            <tr><td><code>i2cdetect -y 1</code> shows empty grid</td><td>I2C interface wasn't enabled - not a wiring problem</td><td>Enabled I2C in raspi-config's interface options, rebooted</td></tr>
            <tr><td>Training too slow on the Pi</td><td>YOLO from scratch on the Pi's CPU isn't practical for a full run</td><td>Trained on a PC with a GPU, exported weights to NCNN for fast inference</td></tr>
          </tbody>
        </table></div>

        <h3>How It Runs</h3>
        <p>Once the environment is set up, the main script opens the webcam, tracks the hand with MediaPipe, samples and matches the fingertip color against the calibrated palette, then drives the servo to the matching angle. Every script also wraps its main loop in a try/except/finally block so that <code>GPIO.cleanup()</code> always runs on exit, even after a crash or Ctrl+C - without that, the next run throws a "channel already in use" error before it even starts.</p>

        <h3>Running Lightweight: Keeping Vision Fast on a Pi</h3>
        <p>A Raspberry Pi's CPU is a fraction of a laptop's, so running OpenCV, MediaPipe, or YOLO at full desktop settings just chokes - the same detection code needs real adjustments to stay smooth:</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Technique</th><th>Why it helps</th></tr></thead>
          <tbody>
            <tr><td>Drop the capture resolution</td><td>The YOLO scripts run inference at a reduced 320x240 instead of the webcam's native resolution - every pixel processed costs CPU time, and detection accuracy rarely needs full resolution to find an object's rough location</td></tr>
            <tr><td>Skip frames instead of processing every one</td><td>Inference only runs on every 3rd frame; the frames in between just reuse the last known result, which is invisible to the eye but cuts detection workload by two-thirds</td></tr>
            <tr><td>Export to a lighter model format</td><td>A YOLO model trained on a PC was exported to NCNN before running on the Pi - NCNN is built specifically for ARM CPUs and runs meaningfully faster than the original PyTorch weights with no retraining needed</td></tr>
            <tr><td>Train on a PC, deploy on the Pi</td><td>Training itself (not just inference) is far too slow on a Pi's CPU for a full run - train on a machine with a GPU, then copy just the exported model file over</td></tr>
            <tr><td>Keep the detection scope narrow</td><td>Fewer object classes means a smaller, faster model - the YOLO model here was trained on exactly the classes actually needed, not a large general-purpose dataset</td></tr>
            <tr><td>Skip the preview window when unattended</td><td><code>cv2.imshow()</code> costs real CPU time to render every frame - running headless (no display, just acting on the detection results) saves that cost when a monitor isn't actually needed</td></tr>
          </tbody>
        </table></div>

        <div class="comp-links">
          <a href="https://github.com/eai-spsm/M.5-Classwork" target="_blank" rel="noopener" class="event-fb"><i class="bi bi-github"></i><span>View on GitHub</span></a>
        </div>
      `,
    },
    th: {
      eyebrow: "ม.5 · งานในชั้นเรียน",
      date: "เทอม 1",
      title: "แล็บ Raspberry Pi ด้าน Vision และ GPIO",
      meta: "ตรวจจับมือ ควบคุมเซอร์โว และตรวจจับวัตถุด้วย YOLOv8 บน Raspberry Pi 4",
      body: `
        <p>สร้างสคริปต์ทดลองมากกว่า 15 ไฟล์ ไล่ระดับตั้งแต่การกะพริบ LED และรับค่าปุ่มกดพื้นฐาน ไปจนถึงระบบ Computer Vision แบบเต็มรูปแบบ โปรเจกต์หลักใช้ MediaPipe ตรวจจับตำแหน่งมือจากกล้อง สุ่มเก็บค่าสีที่ปลายนิ้ว เทียบกับชุดสีที่ปรับเทียบไว้ แล้วสั่งเซอร์โว SG90 ผ่าน PWM ให้หมุนไปยังมุมของสีที่ตรงกัน นอกจากนี้ยังเทรนโมเดล YOLOv8 (12 คลาสวัตถุ) และรันตรวจจับวัตถุแบบเรียลไทม์ผ่านกล้อง พร้อมแสดงชื่อคลาสที่ตรวจพบบนจอ LCD I2C ขนาด 16x2</p>

        <h3>อุปกรณ์ที่ใช้</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>อุปกรณ์</th><th>บทบาท</th></tr></thead>
          <tbody>
            <tr><td>Raspberry Pi 4</td><td>บอร์ดหลัก รัน Debian 13 (trixie) แบบ 64 บิต</td></tr>
            <tr><td>เว็บแคม USB</td><td>ส่งภาพผ่าน <code>/dev/video0</code> สำหรับตรวจจับมือและ YOLO</td></tr>
            <tr><td>เซอร์โว SG90</td><td>ขับเคลื่อนด้วย PWM ตามสีที่ตรงกัน</td></tr>
            <tr><td>เซนเซอร์ HC-SR04</td><td>ทดสอบ GPIO วัดระยะทาง</td></tr>
            <tr><td>มอเตอร์ DC + L298N</td><td>ทดสอบ GPIO ควบคุมมอเตอร์</td></tr>
            <tr><td>จอ LCD I2C 16x2</td><td>แสดงผลตรวจจับ YOLO แบบเรียลไทม์</td></tr>
            <tr><td>LED ปุ่มกด สายไฟ</td><td>สคริปต์ GPIO พื้นฐานช่วงแรก</td></tr>
          </tbody>
        </table></div>

        <h3>เริ่มต้นใช้งาน Pi ให้พร้อม</h3>
        <p>ก่อนโค้ดฝั่ง vision จะรันได้ Pi ต้องมี OS อยู่ใน SD card และมีวิธีเข้าถึงตัวเครื่องได้จริง หลังจากนั้นมีสองทางให้ใช้งาน: ต่อจอโดยตรง หรือรันแบบ "headless" แล้วเชื่อมต่อผ่านเครือข่าย - ซึ่ง headless คือวิธีที่ใช้จริงในโปรเจกต์นี้เป็นประจำ</p>

        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ขั้นตอน</th><th>สิ่งที่ต้องทำ</th></tr></thead>
          <tbody>
            <tr><td>1. แฟลช SD card</td><td>ติดตั้ง <strong>Raspberry Pi Imager</strong> บน PC ทั่วไป เลือก OS (Raspberry Pi OS ซึ่งอิงจาก Debian) เลือก SD card ปลายทาง แล้วเปิดไอคอนรูปเฟือง/ตัวเลือกขั้นสูง <em>ก่อน</em>กดเขียน - ตรงนั้นเองที่ตั้งค่า hostname ชื่อผู้ใช้/รหัสผ่าน และข้อมูล Wi-Fi ไว้ล่วงหน้าได้</td></tr>
            <tr><td>2. เปิดใช้งาน SSH ไว้ล่วงหน้า</td><td>ในหน้าตัวเลือกขั้นสูงเดียวกัน ให้ติ๊ก "Enable SSH" (จะใช้รหัสผ่าน หรือวางคีย์สาธารณะก็ได้) ตรงนี้เองที่ทำให้ตั้งค่าแบบ headless ได้ - Pi จะมี SSH คอยรับการเชื่อมต่ออยู่แล้วตั้งแต่บูตครั้งแรก ไม่ต้องมีจอเลย</td></tr>
            <tr><td>3. บูตแล้วหาตัวเครื่องบนเครือข่าย</td><td>เปิด Pi รอให้เชื่อมต่อ Wi-Fi (หรือเสียบสาย Ethernet) แล้วหาที่อยู่ของมัน - จะเช็คจากรายการอุปกรณ์ในเราเตอร์ หรือลองเชื่อมต่อผ่าน hostname ที่ตั้งไว้ในขั้นตอนที่ 1 โดยตรงก็ได้ (Raspberry Pi OS ประกาศตัวเองผ่าน mDNS)</td></tr>
            <tr><td>4. เชื่อมต่อ SSH ครั้งแรก</td><td>จาก terminal บน PC: <code>ssh username@raspberrypi.local</code> (หรือใช้ IP address ถ้าการ resolve <code>.local</code> ใช้ไม่ได้) - ตอนเชื่อมต่อครั้งแรกจะมี prompt ให้ยืนยัน host key fingerprint ถือเป็นเรื่องปกติ ไม่ใช่คำเตือนที่ต้องกังวลถาวร</td></tr>
          </tbody>
        </table></div>

        <p>ถ้าการ resolve <code>.local</code> ใช้ไม่ได้ และไม่สะดวกเช็ครายการอุปกรณ์จากเราเตอร์ สามารถอ่าน IP address ของ Pi ได้โดยตรง เมื่อมีทางเข้าถึง shell บนเครื่องได้ไม่ว่าจะแบบไหน (ต่อ HDMI+คีย์บอร์ด หรือ session SSH ที่เชื่อมต่ออยู่แล้วด้วยวิธีอื่น) ด้วยคำสั่ง <code>ifconfig</code> (หรือ <code>ip a</code> ที่ใหม่กว่า) - ดูที่ <code>inet</code> address ใต้ <code>wlan0</code> (Wi-Fi) หรือ <code>eth0</code> (Ethernet) และคำสั่งระดับระบบส่วนใหญ่บน Pi - ติดตั้งแพ็กเกจด้วย <code>apt</code>, รัน <code>raspi-config</code>, เปิดใช้งาน I2C/SPI, แก้ไฟล์นอกโฟลเดอร์ home - ต้องเติม <code>sudo</code> นำหน้า เพราะผู้ใช้เริ่มต้นไม่ใช่ root; ถ้าเจอ "Permission denied" ทั้งที่คำสั่งดูถูกต้องแล้ว ส่วนใหญ่มักเป็นเพราะลืม <code>sudo</code> นั่นเอง</p>

        <h3>SSH ผ่าน Terminal ใน VS Code</h3>
        <p>เมื่อ Pi ตอบสนอง SSH ได้แล้ว ทุกอย่างหลังจากนี้ทำจากแล็ปท็อปได้เลย - ไม่ต้องมีคีย์บอร์ดหรือจอต่อกับ Pi อีก วิธีง่ายที่สุดคือรันคำสั่ง <code>ssh username@raspberrypi.local</code> ใน terminal ในตัวของ VS Code (View &rarr; Terminal) เหมือน terminal ทั่วไป - มันจะพาเข้าไปยัง shell ที่รันอยู่บน Pi และทุกคำสั่งจากจุดนั้นจะทำงานบน Pi ไม่ใช่บนแล็ปท็อป</p>
        <p>วิธีที่สะดวกกว่าคือส่วนขยาย <strong>Remote - SSH</strong>: มันจะเชื่อมทั้งหน้าต่าง VS Code เข้ากับ Pi โดยตรง ทำให้ file explorer, terminal ในตัว และแม้แต่ extension ที่ติดตั้งไว้ทำงานบน filesystem ของ Pi โดยตรงทั้งหมด - แก้ไฟล์แล้วเซฟ ก็เซฟลง Pi ทันที ไม่ต้องอัปโหลด/คัดลอกแยกต่างหาก เมื่อเชื่อมต่อสำเร็จ มุมล่างซ้ายจะขึ้นชื่อ remote host เป็นสีเขียว ยืนยันว่า editor กำลังคุยกับ Pi จริง ๆ ไม่ใช่เครื่อง local</p>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>จุดที่พลาดบ่อยเรื่องไฟล์ config:</strong> เวลา Remote - SSH เพิ่ม host ใหม่ให้ มันไม่ได้ใส่ username ให้เสมอไป - บางทีจะเซฟแค่ <code>Host raspberrypi.local</code> เปล่า ๆ โดยไม่มีบรรทัด <code>User</code> เลย ซึ่งจะทำให้เชื่อมต่อไม่สำเร็จ หรือถามหา username ซ้ำทุกครั้ง เปิดไฟล์ SSH config โดยตรง (Remote - SSH: Open SSH Configuration File หรือแก้ <code>~/.ssh/config</code> เอง) แล้วเพิ่มบรรทัดนี้เข้าไปใต้ host ที่ถูกต้องด้วยตัวเอง: <code>User pi</code> (หรือชื่อผู้ใช้ที่ตั้งไว้ตอนใช้ Raspberry Pi Imager) - พอมีบรรทัดนี้แล้ว การเชื่อมต่อจะเหลือแค่คลิกเดียว ไม่ถามซ้ำอีก</div></div>

        <h3>แก้ไฟล์บน Pi ด้วย vim และ nano</h3>
        <p>ไม่ใช่ทุกการแก้ไขที่คุ้มจะเปิด VS Code ขึ้นมา โดยเฉพาะตอนการเชื่อมต่อหน่วง ๆ - บางทีแก้ config เล็ก ๆ น้อย ๆ ตรง terminal SSH ด้วย text editor ที่รันอยู่ในนั้นเลยจะเร็วกว่า</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Editor</th><th>เปิดไฟล์</th><th>บันทึกและออก</th></tr></thead>
          <tbody>
            <tr><td><strong>nano</strong></td><td><code>nano filename.py</code></td><td><code>Ctrl+O</code> แล้ว Enter เพื่อบันทึก, <code>Ctrl+X</code> เพื่อออก - รายการคีย์ลัดจะแสดงอยู่ด้านล่างจอตลอด นี่คือเหตุผลที่มันเป็นตัวเลือกเริ่มต้นที่เป็นมิตรกว่า</td></tr>
            <tr><td><strong>vim</strong></td><td><code>vim filename.py</code></td><td>กด <code>i</code> เพื่อเริ่มพิมพ์ (insert mode), <code>Esc</code> เพื่อหยุด แล้วพิมพ์ <code>:wq</code> กด Enter เพื่อบันทึกและออก (หรือ <code>:q!</code> เพื่อออกโดยไม่บันทึก) - ไม่มีคำแนะนำบนหน้าจอให้โดยปกติ ซึ่งเป็นเหตุผลที่คนเปิดใช้ครั้งแรกมักติดอยู่ข้างในเพราะไม่รู้วิธีออก</td></tr>
          </tbody>
        </table></div>

        <h3>ต่อจอโดยตรงผ่าน HDMI</h3>
        <p>บางครั้งก็ทำแบบ headless ไม่ได้ - เช่นตอนดีบั๊กว่าทำไมหน้าต่าง preview กล้องไม่ขึ้น จำเป็นต้องมีจอจริง ๆ วิธีคือใช้สาย micro-HDMI ต่อ HDMI (Pi 4 มีพอร์ต micro-HDMI ไม่ใช่ขนาดเต็ม) เข้าจอมอนิเตอร์ พร้อมเสียบคีย์บอร์ดและเมาส์ USB โดยตรง วิธีนี้จะบูตเข้าเดสก์ท็อป (หรือหน้า login) ได้เลยโดยไม่ต้องตั้งค่าเครือข่ายใด ๆ ซึ่งทำให้เป็นทางสำรองเวลา SSH เชื่อมต่อไม่ได้ - ไม่ว่าจะเป็นรหัส Wi-Fi ผิด, ยังไม่ได้เปิดใช้งาน SSH, หรือ Pi ยังไม่เคยเชื่อมต่อเครือข่ายเลยตั้งแต่แรก</p>

        <h3>การติดตั้ง</h3>
        <p>ในโปรเจกต์มีสคริปต์ติดตั้งอัตโนมัติมาให้ ซึ่งเป็นตัวที่เราใช้ตามปกติ ตรวจสอบเวอร์ชัน Python สร้าง virtual environment แยกต่างหาก และติดตั้งไลบรารีตามเวอร์ชันที่ล็อกไว้ให้เอง:</p>
        <pre class="code-block"><code>./setup.sh</code></pre>
        <p>ขั้นตอนแบบมือที่เทียบเท่ากัน เผื่ออยากรู้ว่ามันทำอะไรอยู่จริง ๆ:</p>
        <pre class="code-block"><code>pyenv install 3.11.9
pyenv local 3.11.9
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt</code></pre>

        <h3>เลือก Python Interpreter ให้ถูกตัว</h3>
        <p>เป็นปัญหาแบบเดียวกับเลือก interpreter ผิดใน editor ไหนก็ได้: venv อาจติดตั้งทุกแพ็กเกจถูกต้องครบแล้ว แต่โค้ดยังฟ้อง <code>ModuleNotFoundError</code> เพราะ VS Code (หรืออะไรก็ตามที่รันสคริปต์) กำลังชี้ไปที่ Python <em>คนละตัว</em> กับที่ตอนรัน <code>pip install</code> ใช้ โปรเจกต์นี้มี Python สองสภาพแวดล้อมให้สับสนได้พอดี คือ system Python กับ <code>venv/</code> - เลือกผิดตัวคือบั๊กที่พบบ่อยที่สุดแบบ "รันใน terminal ได้ แต่กด Run แล้วไม่ทำงาน"</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>วิธีเช็ก</th><th>ยืนยันอะไร</th></tr></thead>
          <tbody>
            <tr><td><code>Ctrl+Shift+P</code> &rarr; <strong>Python: Select Interpreter</strong></td><td>เลือกตัวที่ขึ้นเป็น <code>./venv/bin/python</code> ไม่ใช่ตัว system เปล่า ๆ - หลังจากนั้น VS Code จะโชว์ interpreter ที่ active อยู่ที่แถบสถานะมุมล่างขวาตลอด ไม่ใช่เช็กแค่ครั้งเดียวจบ</td></tr>
            <tr><td><code>which python3</code> ใน terminal ในตัว</td><td>มีความหมายก็ต่อเมื่อ <em>รันหลัง</em> <code>source venv/bin/activate</code> แล้วเท่านั้น - ถ้า path ที่ขึ้นมาไม่ได้ลงท้ายด้วย <code>venv/bin/python3</code> แปลว่า venv ยังไม่ active จริงใน terminal นั้น ไม่ว่าแถบสถานะของ editor จะแสดงว่าอะไรก็ตาม</td></tr>
            <tr><td><code>pip list</code> เทียบกับ <code>python3 -c "import cv2"</code></td><td>ถ้า <code>pip list</code> ขึ้นว่ามีแพ็กเกจแล้ว แต่ import ยัง fail แปลว่า terminal ที่รัน <code>pip install</code> กับตัวที่รันสคริปต์เป็นคนละสภาพแวดล้อมกัน - กลับไปเช็กสองข้อบนอีกที</td></tr>
          </tbody>
        </table></div>
        <p>โฟลเดอร์ <code>venv/</code> เองไม่เคย commit เข้า repo (อยู่ใน <code>.gitignore</code> พร้อมกับ <code>env/</code> ที่เหลือจากการทดลองช่วงแรก) - ต้องสร้างใหม่ในเครื่องด้วย <code>./setup.sh</code> หรือทำตามขั้นตอนมือด้านบนทุกครั้งที่ clone ใหม่ ทุกเครื่อง รวมถึง Pi ที่เพิ่ง flash ใหม่ด้วย</p>

        <h3>คำสั่ง Terminal ที่ใช้บ่อย</h3>
        <p>คำสั่งที่ใช้เป็นประจำเวลาทำงานแบบ headless ผ่าน SSH นอกเหนือจาก editor สองตัวข้างบน:</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>คำสั่ง</th><th>ทำอะไร</th></tr></thead>
          <tbody>
            <tr><td><code>ls -la</code></td><td>แสดงทุกอย่างในโฟลเดอร์ปัจจุบัน รวมไฟล์ที่ซ่อนอยู่ (dotfile) พร้อมสิทธิ์การเข้าถึง</td></tr>
            <tr><td><code>cd path/</code> / <code>cd ..</code> / <code>cd ~</code></td><td>เข้าโฟลเดอร์ / ถอยขึ้นหนึ่งระดับ / กลับไปโฟลเดอร์ home</td></tr>
            <tr><td><code>pwd</code></td><td>แสดง path เต็มของโฟลเดอร์ปัจจุบัน - มีประโยชน์เวลาหลงทางหลังต่อ SSH นาน ๆ</td></tr>
            <tr><td><code>mkdir -p a/b/c</code></td><td>สร้างโฟลเดอร์ (พร้อมโฟลเดอร์แม่ที่ยังไม่มี) ในคำสั่งเดียว</td></tr>
            <tr><td><code>cp -r src dst</code> / <code>mv src dst</code></td><td>คัดลอกโฟลเดอร์แบบ recursive / ย้ายหรือเปลี่ยนชื่อไฟล์หรือโฟลเดอร์</td></tr>
            <tr><td><code>rm -rf folder/</code></td><td>ลบโฟลเดอร์และทุกอย่างข้างในทันที ไม่มีถามยืนยัน - กู้คืนไม่ได้ เช็ก path ให้ดีก่อนกด</td></tr>
            <tr><td><code>chmod +x setup.sh</code></td><td>ทำเครื่องหมายให้สคริปต์รันได้ จำเป็นก่อนที่ <code>./setup.sh</code> จะใช้งานได้เลย</td></tr>
            <tr><td><code>sudo systemctl status ssh</code></td><td>เช็กว่า background service (ในที่นี้คือ SSH) กำลังรันอยู่จริงไหม</td></tr>
            <tr><td><code>htop</code></td><td>ดูการใช้ CPU/RAM แบบเรียลไทม์ต่อโปรเซส - สิ่งแรกที่ควรเช็กเวลา Pi รู้สึกอืด</td></tr>
            <tr><td><code>df -h</code></td><td>พื้นที่ดิสก์ว่างต่อไดรฟ์ที่ mount ไว้ แบบอ่านง่าย (GB/MB แทนไบต์ดิบ)</td></tr>
            <tr><td><code>Ctrl+C</code></td><td>หยุดสิ่งที่กำลังรันอยู่ใน foreground ของ terminal นั้น - ปุ่มมาตรฐานเวลาอยากออกจากอะไรสักอย่าง</td></tr>
          </tbody>
        </table></div>

        <h3>ปัญหาที่พบ</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ข้อผิดพลาด</th><th>สาเหตุ</th><th>วิธีแก้</th></tr></thead>
          <tbody>
            <tr><td><code>ModuleNotFoundError: cv2</code></td><td>mediapipe==0.10.9 มี wheel สำหรับ aarch64 เฉพาะ Python 3.11</td><td>ล็อกเวอร์ชันเป็น Python 3.11.9 ผ่าน pyenv ก่อนสร้าง venv</td></tr>
            <tr><td><code>qt.qpa.xcb: could not connect to display</code></td><td>ไม่มี <code>DISPLAY</code> เพราะ SSH ไม่มีจอแสดงผลให้โดยปกติ</td><td>เติม <code>DISPLAY=:0</code> หน้าคำสั่ง และเชื่อมต่อผ่าน Raspberry Pi Connect หรือ VNC</td></tr>
            <tr><td>Could not open camera device at index 0</td><td>มีโปรเซสอื่นถือ <code>/dev/video0</code> ค้างอยู่</td><td>ตรวจด้วย <code>lsusb</code> และปิดโปรเซสค้างด้วย <code>fuser /dev/video0</code></td></tr>
            <tr><td><code>externally-managed-environment</code></td><td>PEP 668 ของ Debian 12+ บล็อกการติดตั้ง pip แบบ system-wide</td><td>เปิดใช้งาน virtual environment ก่อนเสมอ</td></tr>
            <tr><td>สีที่จับคู่กำกวม</td><td>สีเป้าหมายสองสีอยู่ใกล้กันเกินไปในพื้นที่สี RGB</td><td>ขยายระยะห่างของสี ปรับเทียบใหม่ด้วย (calibrate_colors.py)</td></tr>
            <tr><td><code>i2cdetect -y 1</code> แสดงตารางว่าง</td><td>ยังไม่ได้เปิดใช้งาน I2C ไม่ใช่ปัญหาสายไฟ</td><td>เปิด I2C ใน raspi-config แล้วรีบูต</td></tr>
            <tr><td>เทรนบน Pi ช้าเกินไป</td><td>เทรน YOLO จากศูนย์บน CPU ของ Pi ไม่เหมาะกับการรันเต็มรูปแบบ</td><td>เทรนบน PC ที่มี GPU แล้วแปลงโมเดลเป็น NCNN</td></tr>
          </tbody>
        </table></div>

        <h3>วิธีการทำงาน</h3>
        <p>เมื่อสภาพแวดล้อมพร้อมแล้ว สคริปต์หลักจะเปิดกล้อง ตรวจจับมือด้วย MediaPipe สุ่มและจับคู่สีที่ปลายนิ้วกับชุดสีที่ปรับเทียบไว้ แล้วสั่งเซอร์โวหมุนไปยังมุมที่ตรงกัน ทุกสคริปต์ยังครอบลูปหลักด้วย try/except/finally เพื่อให้ <code>GPIO.cleanup()</code> ทำงานเสมอตอนออกจากโปรแกรม แม้จะพังหรือกด Ctrl+C ก็ตาม - ถ้าไม่ทำแบบนี้ การรันครั้งถัดไปจะเจอ error "channel already in use" ตั้งแต่ยังไม่ทันเริ่ม</p>

        <h3>รันแบบเบา: รักษาความเร็ว Vision บน Pi</h3>
        <p>CPU ของ Raspberry Pi แรงแค่เศษเสี้ยวของแล็ปท็อป การรัน OpenCV, MediaPipe หรือ YOLO ด้วยค่าตั้งต้นระดับเดสก์ท็อปเต็มรูปแบบจะทำให้เครื่องอืดทันที - โค้ดตรวจจับชุดเดิมต้องปรับจริง ๆ ถึงจะรันลื่น:</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>เทคนิค</th><th>ทำไมถึงช่วย</th></tr></thead>
          <tbody>
            <tr><td>ลดความละเอียดภาพที่จับ</td><td>สคริปต์ YOLO รัน inference ที่ความละเอียดลดลงเหลือ 320x240 แทนความละเอียดเต็มของเว็บแคม - ทุกพิกเซลที่ประมวลผลกินเวลา CPU และความแม่นยำในการตรวจจับแทบไม่ต้องการความละเอียดเต็มเพื่อหาตำแหน่งคร่าว ๆ ของวัตถุ</td></tr>
            <tr><td>ข้ามเฟรมแทนที่จะประมวลผลทุกเฟรม</td><td>รัน inference แค่ทุกเฟรมที่ 3 เท่านั้น เฟรมระหว่างนั้นใช้ผลล่าสุดซ้ำ ซึ่งตาแทบมองไม่ออก แต่ลดภาระการตรวจจับลงถึงสองในสาม</td></tr>
            <tr><td>แปลงเป็นฟอร์แมตโมเดลที่เบากว่า</td><td>โมเดล YOLO ที่เทรนบน PC ถูกแปลงเป็น NCNN ก่อนนำมารันบน Pi - NCNN ถูกสร้างมาสำหรับ CPU ตระกูล ARM โดยเฉพาะ และรันได้เร็วกว่าน้ำหนักโมเดล PyTorch เดิมอย่างเห็นได้ชัดโดยไม่ต้องเทรนใหม่</td></tr>
            <tr><td>เทรนบน PC แล้วนำไปใช้บน Pi</td><td>การเทรน (ไม่ใช่แค่ inference) ช้าเกินไปมากบน CPU ของ Pi สำหรับการรันเต็มรูปแบบ - เทรนบนเครื่องที่มี GPU แล้วคัดลอกเฉพาะไฟล์โมเดลที่ export ออกมาไปใช้</td></tr>
            <tr><td>จำกัดขอบเขตการตรวจจับให้แคบ</td><td>คลาสวัตถุน้อยลงหมายถึงโมเดลที่เล็กและเร็วขึ้น - โมเดล YOLO ในโปรเจกต์นี้เทรนมาเฉพาะคลาสที่ต้องใช้จริง ไม่ใช่ dataset ทั่วไปขนาดใหญ่</td></tr>
            <tr><td>ปิดหน้าต่าง preview เมื่อไม่มีคนเฝ้า</td><td><code>cv2.imshow()</code> กินเวลา CPU จริงในการวาดทุกเฟรม - การรันแบบ headless (ไม่มีจอ แค่ทำงานตามผลตรวจจับ) ช่วยประหยัดส่วนนี้เมื่อไม่จำเป็นต้องมีจอจริง ๆ</td></tr>
          </tbody>
        </table></div>

        <div class="comp-links">
          <a href="https://github.com/eai-spsm/M.5-Classwork" target="_blank" rel="noopener" class="event-fb"><i class="bi bi-github"></i><span>ดูซอร์สโค้ดบน GitHub</span></a>
        </div>
      `,
    },
  },

  "m5-final-project": {
    icon: "bi-robot",
    backAnchor: "m5",
    en: {
      eyebrow: "M.5 · Reports & Docs",
      date: "Semester 1",
      title: "M.5 Final Project - Mecanum Drive Robot",
      meta: "4-motor mecanum drive, dead-reckoning guidance, and YOLO camera detection for a ball-touching competition robot.",
      body: `
        <p>Built for a ball-touching robot competition: a Raspberry Pi 4 robot on a 4-wheel mecanum base (2x L298N-style driver boards, one per side), with a YOLO-trained camera for ball detection and dead-reckoning position tracking layered on top. The codebase is split into three reusable pieces - <code>movement/</code> for motor control, <code>guidance/</code> for position tracking, <code>perception/</code> for the camera - so the autonomous match logic in <code>main.py</code> can just import and combine them instead of duplicating GPIO code.</p>

        <h3>Hardware</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Component</th><th>Role</th></tr></thead>
          <tbody>
            <tr><td>Raspberry Pi 4</td><td>Main board</td></tr>
            <tr><td>2x L298N-style driver board</td><td>One per side, each driving 2 DC motors</td></tr>
            <tr><td>4x DC motor</td><td>2 left, 2 right - the mecanum wheels</td></tr>
            <tr><td>Push button</td><td>Start button, held on an internal pull-up</td></tr>
            <tr><td>HC-SR04 ultrasonic sensor</td><td>Distance sensing (obstacle check currently disabled on forward drive)</td></tr>
            <tr><td>USB webcam</td><td>Feeds the YOLO detection pipeline</td></tr>
            <tr><td>Battery pack</td><td>Powers the Pi and both driver boards</td></tr>
          </tbody>
        </table></div>
        <p>Orientation convention used throughout the code and wiring: battery side = North (front), Raspberry Pi side = South (back).</p>

        <h3>Wiring (BCM pin numbers)</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Signal</th><th>BCM Pin</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>IN1-IN4</td><td>4, 17, 27, 22</td><td>Board 1 (Left)</td></tr>
            <tr><td>ENA_L / ENB_L</td><td>12 / 18</td><td>Board 1 PWM enable (IN1/IN2 and IN3/IN4)</td></tr>
            <tr><td>IN5-IN8</td><td>5, 6, 19, 26</td><td>Board 2 (Right)</td></tr>
            <tr><td>ENA_R / ENB_R</td><td>13 / 23</td><td>Board 2 PWM enable (IN5/IN6 and IN7/IN8)</td></tr>
            <tr><td>BTN_PIN</td><td>21</td><td>Start button, other leg to GND</td></tr>
            <tr><td>TRIG / ECHO</td><td>10 / 9</td><td>Ultrasonic trigger (output) / echo (input)</td></tr>
          </tbody>
        </table></div>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>The two driver boards aren't wired symmetrically:</strong> the left board's first channel pair (IN1/IN2) drives the <em>front</em> wheel, but the right board's first channel pair (IN5/IN6) drives the <em>rear</em> wheel. This only surfaced by testing each wheel in isolation - don't assume the same front/rear convention on both sides if the robot ever gets rewired.</div></div>

        <h3>Code Layout</h3>
        <pre class="code-block"><code>main.py              # entry point: start button -&gt; hands off to match logic
default_control.py   # keyboard control (testing/manual driving)
cam_control.py        # live camera view over HTTP (no HDMI needed)
movement/
  movement.py          # MecanumDrive - all motor/GPIO logic, forward/strafe/rotate/stop
guidance/
  navigator.py         # Navigator - dead-reckoning (x, y, heading) estimate
  guided_drive.py      # GuidedDrive - MecanumDrive + Navigator combined
perception/
  test.py               # YOLO detection on the webcam feed
  train.py              # trains a YOLO model (run on a PC with a GPU)
  data/                  # best.pt / data.yaml go here</code></pre>
        <p><code>MecanumDrive</code> holds every motor pin setup, calibration constant (<code>WHEEL_INVERT</code>, <code>WHEEL_TRIM</code>, speeds), and movement method (<code>forward</code>, <code>strafe_left/right</code>, <code>rotate_left/right</code>, <code>stop</code>, <code>test_wheel</code>, <code>get_distance</code>) - anything that needs to drive the robot imports this instead of duplicating GPIO code. <code>GuidedDrive</code> wraps it with <code>Navigator</code>, so calling a movement method both drives the motors <em>and</em> updates the estimated pose in one call - <code>.pose()</code> returns <code>(x_cm, y_cm, heading_deg)</code> at any time. There are no wheel encoders on this robot, so position tracking is open-loop dead-reckoning: good for "roughly where am I," not precision navigation, and it drifts over a long run from wheel slip and uneven floor.</p>

        <h3>Software Setup &amp; Running</h3>
        <pre class="code-block"><code>sudo apt update
sudo apt install python3-pip python3-opencv
pip3 install RPi.GPIO ultralytics</code></pre>
        <p>Drop trained weights into <code>perception/data/best.pt</code> (and <code>data.yaml</code> if retraining), then:</p>
        <pre class="code-block"><code>python3 main.py              # full match program
python3 default_control.py   # keyboard-driven manual control
python3 cam_control.py       # live camera stream, no HDMI needed
python3 perception/test.py   # YOLO detection on the webcam feed</code></pre>

        <h3>Viewing the Camera Without a Monitor</h3>
        <p>There's no HDMI monitor on the robot, so <code>cv2.imshow()</code> (a desktop window) simply doesn't work over SSH. <code>cam_control.py</code> works around that by serving the webcam as an MJPEG stream over HTTP instead - view-only, no detection running, just for aiming the camera or checking focus.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Step</th><th>What to do</th></tr></thead>
          <tbody>
            <tr><td>1. Start the stream</td><td>On the Pi: <code>python3 cam_control.py</code> - it prints a URL like <code>http://&lt;pi-ip&gt;:8080/</code>; find the Pi's IP with <code>hostname -I</code> if needed</td></tr>
            <tr><td>2. Open it</td><td>In VS Code connected over Remote-SSH: <code>Ctrl+Shift+P</code> &rarr; <strong>Simple Browser: Show</strong>, paste that URL - the feed opens in a tab inside the editor. Any regular browser on the same network works too (phone, laptop)</td></tr>
            <tr><td>3. Stop it</td><td><code>Ctrl+C</code> on the Pi</td></tr>
          </tbody>
        </table></div>

        <h3>Keyboard Controls (default_control.py)</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Key</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td>W / S</td><td>Drive forward / backward</td></tr>
            <tr><td>A / D</td><td>Strafe left / right</td></tr>
            <tr><td>Q / E</td><td>Rotate left (CCW) / right (CW)</td></tr>
            <tr><td>1 / 2 / 3 / 4</td><td>Spin front-left / front-right / rear-left / rear-right wheel alone (calibration)</td></tr>
            <tr><td>Space</td><td>Stop all wheels</td></tr>
            <tr><td>B</td><td>About-face - rotate 180&deg; from current heading</td></tr>
            <tr><td>R</td><td>Reset tracked position to (0, 0), heading 0</td></tr>
            <tr><td>+ / -</td><td>Adjust speed by 5 (clamped 20-100)</td></tr>
            <tr><td>H</td><td>HALT - stops and locks out every other key until pressed again (X still works)</td></tr>
            <tr><td>X / Ctrl+C</td><td>Quit (also cleans up GPIO)</td></tr>
          </tbody>
        </table></div>
        <p>The tracked position/heading shows live on one updating status line, no key needed to see it. A drive timer starts automatically on the first movement command, pauses while HALTed, and stops for good on quit, printing total drive time on exit.</p>

        <h3>Calibrating the Drive</h3>
        <p>If W drives diagonally instead of straight, one wheel is physically wired backward - press <strong>1/2/3/4</strong> to spin each wheel in isolation (robot jacked up, wheels off the ground), find the one pushing the wrong way, and flip its entry in <code>WHEEL_INVERT</code> in <code>movement/movement.py</code>.</p>
        <p>Once straight driving and rotation are clean, A/D (strafe) can still drift - this is normal, since strafing needs much tighter wheel-speed matching than driving straight does. Fix it with <code>WHEEL_TRIM</code> (a per-wheel speed multiplier): press A, see which side the robot rotates toward, and slightly lower the trim (e.g. <code>0.95</code>) on the wheel "winning" that rotation.</p>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>Keep duty cycle (<code>STRAFE_SPEED &times; WHEEL_TRIM</code>) inside roughly 45-60.</strong> Below ~45 some motors don't have enough torque to move (a "dead zone"); above ~60 an electrical glitch on cheap L298N-style boards can flip an H-bridge mid-hold, reversing a wheel's direction while the key is still down - that's a hardware/current issue, not a code bug. Make small trim adjustments (&plusmn;0.05-0.1) at a time.</div></div>

        <div class="comp-links">
          <a href="https://github.com/eai-spsm/M.5-Classwork" target="_blank" rel="noopener" class="event-fb"><i class="bi bi-github"></i><span>View on GitHub</span></a>
        </div>
      `,
    },
    th: {
      eyebrow: "ม.5 · งานในชั้นเรียน",
      date: "เทอม 1",
      title: "โปรเจกต์จบ ม.5 - หุ่นยนต์ขับเคลื่อนแบบ Mecanum",
      meta: "ขับเคลื่อน 4 มอเตอร์แบบ mecanum ติดตามตำแหน่งแบบ dead-reckoning และตรวจจับบอลด้วยกล้อง YOLO สำหรับหุ่นยนต์แข่งแตะบอล",
      body: `
        <p>สร้างขึ้นสำหรับการแข่งขันหุ่นยนต์แตะบอล: หุ่นยนต์ Raspberry Pi 4 บนฐานล้อ mecanum 4 ล้อ (บอร์ดขับมอเตอร์แบบ L298N 2 ตัว ข้างละตัว) พร้อมกล้องที่เทรนด้วย YOLO สำหรับตรวจจับบอล และระบบติดตามตำแหน่งแบบ dead-reckoning ซ้อนอยู่ด้านบน โค้ดแบ่งออกเป็นสามส่วนที่ใช้ซ้ำได้ - <code>movement/</code> สำหรับควบคุมมอเตอร์ <code>guidance/</code> สำหรับติดตามตำแหน่ง <code>perception/</code> สำหรับกล้อง - เพื่อให้ตรรกะการแข่งขันอัตโนมัติใน <code>main.py</code> แค่ import แล้วนำมาประกอบกันได้ ไม่ต้องเขียนโค้ด GPIO ซ้ำ</p>

        <h3>อุปกรณ์</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>อุปกรณ์</th><th>บทบาท</th></tr></thead>
          <tbody>
            <tr><td>Raspberry Pi 4</td><td>บอร์ดหลัก</td></tr>
            <tr><td>บอร์ดขับมอเตอร์แบบ L298N 2 ตัว</td><td>ข้างละตัว แต่ละตัวขับมอเตอร์ DC 2 ตัว</td></tr>
            <tr><td>มอเตอร์ DC 4 ตัว</td><td>ซ้าย 2 ขวา 2 - ล้อ mecanum</td></tr>
            <tr><td>ปุ่มกด</td><td>ปุ่มเริ่ม ต่อแบบ internal pull-up</td></tr>
            <tr><td>เซนเซอร์ HC-SR04</td><td>วัดระยะทาง (ปิดการเช็กสิ่งกีดขวางตอนเดินหน้าไว้ชั่วคราว)</td></tr>
            <tr><td>เว็บแคม USB</td><td>ป้อนภาพให้ pipeline ตรวจจับ YOLO</td></tr>
            <tr><td>แบตเตอรี่</td><td>จ่ายไฟให้ Pi และบอร์ดขับมอเตอร์ทั้งสอง</td></tr>
          </tbody>
        </table></div>
        <p>ทิศทางที่ใช้ตลอดทั้งโค้ดและการเดินสาย: ฝั่งแบตเตอรี่ = เหนือ (หน้า), ฝั่ง Raspberry Pi = ใต้ (หลัง)</p>

        <h3>การเดินสาย (เลขขา BCM)</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>สัญญาณ</th><th>ขา BCM</th><th>หมายเหตุ</th></tr></thead>
          <tbody>
            <tr><td>IN1-IN4</td><td>4, 17, 27, 22</td><td>บอร์ด 1 (ซ้าย)</td></tr>
            <tr><td>ENA_L / ENB_L</td><td>12 / 18</td><td>PWM เปิดใช้งานบอร์ด 1 (IN1/IN2 และ IN3/IN4)</td></tr>
            <tr><td>IN5-IN8</td><td>5, 6, 19, 26</td><td>บอร์ด 2 (ขวา)</td></tr>
            <tr><td>ENA_R / ENB_R</td><td>13 / 23</td><td>PWM เปิดใช้งานบอร์ด 2 (IN5/IN6 และ IN7/IN8)</td></tr>
            <tr><td>BTN_PIN</td><td>21</td><td>ปุ่มเริ่ม อีกขาต่อ GND</td></tr>
            <tr><td>TRIG / ECHO</td><td>10 / 9</td><td>ขาส่งสัญญาณ / รับสัญญาณของอัลตราโซนิก</td></tr>
          </tbody>
        </table></div>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>บอร์ดขับมอเตอร์สองตัวไม่ได้เดินสายแบบสมมาตรกัน:</strong> คู่ช่องแรกของบอร์ดซ้าย (IN1/IN2) ขับล้อ <em>หน้า</em> แต่คู่ช่องแรกของบอร์ดขวา (IN5/IN6) กลับขับล้อ <em>หลัง</em> เรื่องนี้เจอได้จากการทดสอบล้อทีละตัวเท่านั้น - อย่าสันนิษฐานว่าทั้งสองฝั่งใช้ธรรมเนียมหน้า/หลังเดียวกันถ้าต้องเดินสายใหม่</div></div>

        <h3>โครงสร้างโค้ด</h3>
        <pre class="code-block"><code>main.py              # จุดเริ่มโปรแกรม: รอปุ่มเริ่ม -&gt; ส่งต่อให้ตรรกะการแข่งขัน
default_control.py   # ควบคุมด้วยคีย์บอร์ด (ทดสอบ/ขับเอง)
cam_control.py        # สตรีมกล้องผ่าน HTTP (ไม่ต้องมีจอ HDMI)
movement/
  movement.py          # MecanumDrive - โค้ด motor/GPIO ทั้งหมด เดินหน้า/สไลด์/หมุน/หยุด
guidance/
  navigator.py         # Navigator - ประมาณตำแหน่ง (x, y, heading) แบบ dead-reckoning
  guided_drive.py      # GuidedDrive - รวม MecanumDrive กับ Navigator เข้าด้วยกัน
perception/
  test.py               # ตรวจจับด้วย YOLO บนภาพจากเว็บแคม
  train.py              # เทรนโมเดล YOLO (รันบน PC ที่มี GPU)
  data/                  # เก็บ best.pt / data.yaml</code></pre>
        <p><code>MecanumDrive</code> เก็บการตั้งค่าขามอเตอร์ทั้งหมด ค่าคาลิเบรต (<code>WHEEL_INVERT</code>, <code>WHEEL_TRIM</code>, ความเร็ว) และเมธอดการเคลื่อนที่ (<code>forward</code>, <code>strafe_left/right</code>, <code>rotate_left/right</code>, <code>stop</code>, <code>test_wheel</code>, <code>get_distance</code>) - อะไรก็ตามที่ต้องขับหุ่นยนต์ให้ import ตัวนี้แทนการเขียนโค้ด GPIO ซ้ำ <code>GuidedDrive</code> ห่อ <code>MecanumDrive</code> ด้วย <code>Navigator</code> เพื่อให้การเรียกเมธอดเคลื่อนที่หนึ่งครั้งทั้งขับมอเตอร์ <em>และ</em> อัปเดตตำแหน่งที่ประมาณไว้ไปพร้อมกัน - <code>.pose()</code> คืนค่า <code>(x_cm, y_cm, heading_deg)</code> ได้ทุกเมื่อ หุ่นยนต์ตัวนี้ไม่มี wheel encoder จึงเป็นการติดตามตำแหน่งแบบ open-loop dead-reckoning: เหมาะกับ "ประมาณว่าอยู่ตรงไหน" ไม่ใช่การนำทางแม่นยำ และจะคลาดเคลื่อนมากขึ้นเมื่อวิ่งนาน ๆ จากล้อลื่นและพื้นไม่เรียบ</p>

        <h3>ติดตั้งซอฟต์แวร์และรัน</h3>
        <pre class="code-block"><code>sudo apt update
sudo apt install python3-pip python3-opencv
pip3 install RPi.GPIO ultralytics</code></pre>
        <p>ใส่ weight ที่เทรนแล้วลงใน <code>perception/data/best.pt</code> (และ <code>data.yaml</code> ถ้าจะเทรนใหม่) จากนั้น:</p>
        <pre class="code-block"><code>python3 main.py              # โปรแกรมแข่งขันเต็มรูปแบบ
python3 default_control.py   # ควบคุมด้วยคีย์บอร์ด
python3 cam_control.py       # สตรีมกล้องสด ไม่ต้องมี HDMI
python3 perception/test.py   # ตรวจจับด้วย YOLO บนภาพจากเว็บแคม</code></pre>

        <h3>ดูภาพกล้องโดยไม่มีจอ</h3>
        <p>หุ่นยนต์ไม่มีจอ HDMI ต่ออยู่ ดังนั้น <code>cv2.imshow()</code> (หน้าต่างเดสก์ท็อป) จึงใช้งานผ่าน SSH ไม่ได้ <code>cam_control.py</code> แก้ปัญหานี้ด้วยการสตรีมภาพเว็บแคมเป็น MJPEG ผ่าน HTTP แทน - ดูได้อย่างเดียว ไม่มีการตรวจจับรันอยู่ ใช้แค่เล็งกล้องหรือเช็กโฟกัส</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ขั้นตอน</th><th>สิ่งที่ต้องทำ</th></tr></thead>
          <tbody>
            <tr><td>1. เริ่มสตรีม</td><td>บน Pi: <code>python3 cam_control.py</code> - จะพิมพ์ URL แบบ <code>http://&lt;pi-ip&gt;:8080/</code> ออกมา หา IP ของ Pi ด้วย <code>hostname -I</code> ถ้ายังไม่รู้</td></tr>
            <tr><td>2. เปิดดู</td><td>ใน VS Code ที่เชื่อมต่อผ่าน Remote-SSH: <code>Ctrl+Shift+P</code> &rarr; <strong>Simple Browser: Show</strong> แล้ววาง URL นั้น - ภาพจะเปิดในแท็บภายใน editor เลย หรือเปิดผ่านเบราว์เซอร์ทั่วไปบนเครือข่ายเดียวกันก็ได้ (มือถือ แล็ปท็อป)</td></tr>
            <tr><td>3. หยุดสตรีม</td><td>กด <code>Ctrl+C</code> บน Pi</td></tr>
          </tbody>
        </table></div>

        <h3>ควบคุมด้วยคีย์บอร์ด (default_control.py)</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ปุ่ม</th><th>การทำงาน</th></tr></thead>
          <tbody>
            <tr><td>W / S</td><td>เดินหน้า / ถอยหลัง</td></tr>
            <tr><td>A / D</td><td>สไลด์ซ้าย / ขวา</td></tr>
            <tr><td>Q / E</td><td>หมุนซ้าย (ทวนเข็ม) / หมุนขวา (ตามเข็ม)</td></tr>
            <tr><td>1 / 2 / 3 / 4</td><td>หมุนล้อหน้าซ้าย / หน้าขวา / หลังซ้าย / หลังขวา ทีละล้อ (สำหรับคาลิเบรต)</td></tr>
            <tr><td>Space</td><td>หยุดล้อทั้งหมด</td></tr>
            <tr><td>B</td><td>กลับหลังหัน - หมุน 180&deg; จาก heading ปัจจุบัน</td></tr>
            <tr><td>R</td><td>รีเซ็ตตำแหน่งที่ติดตามเป็น (0, 0), heading 0</td></tr>
            <tr><td>+ / -</td><td>ปรับความเร็วทีละ 5 (จำกัดช่วง 20-100)</td></tr>
            <tr><td>H</td><td>HALT - หยุดและล็อกปุ่มอื่นทั้งหมดจนกว่าจะกดซ้ำ (X ยังใช้ได้)</td></tr>
            <tr><td>X / Ctrl+C</td><td>ออกจากโปรแกรม (เคลียร์ GPIO ให้ด้วย)</td></tr>
          </tbody>
        </table></div>
        <p>ตำแหน่ง/heading ที่ติดตามอยู่จะแสดงสดบนบรรทัดสถานะที่อัปเดตตลอด ไม่ต้องกดปุ่มเพื่อดู ตัวจับเวลาขับจะเริ่มอัตโนมัติตอนสั่งเคลื่อนที่ครั้งแรก หยุดชั่วคราวตอน HALT และหยุดถาวรตอนออกโปรแกรม พร้อมพิมพ์เวลารวมที่ขับออกมาตอนจบ</p>

        <h3>คาลิเบรตระบบขับเคลื่อน</h3>
        <p>ถ้ากด W แล้ววิ่งเฉียงแทนที่จะตรง แปลว่าล้อใดล้อหนึ่งเดินสายกลับด้าน - กด <strong>1/2/3/4</strong> เพื่อหมุนแต่ละล้อทีละตัว (ยกหุ่นยนต์ให้ล้อลอยจากพื้น) หาล้อที่ดันผิดทาง แล้วสลับค่าของล้อนั้นใน <code>WHEEL_INVERT</code> ที่ <code>movement/movement.py</code></p>
        <p>เมื่อเดินหน้า/ถอยหลัง/หมุนตรงแล้ว A/D (สไลด์) อาจยังเบี้ยวอยู่ - เป็นเรื่องปกติ เพราะการสไลด์ต้องการความเร็วล้อที่ตรงกันแม่นยำกว่าการเดินตรงมาก แก้ด้วย <code>WHEEL_TRIM</code> (ตัวคูณความเร็วต่อล้อ): กด A ดูว่าหุ่นยนต์หมุนไปฝั่งไหน แล้วลดค่า trim ของล้อฝั่งที่ "ชนะ" การหมุนนั้นลงเล็กน้อย (เช่น <code>0.95</code>)</p>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>รักษา duty cycle (<code>STRAFE_SPEED &times; WHEEL_TRIM</code>) ให้อยู่ในช่วงประมาณ 45-60</strong> ต่ำกว่า ~45 มอเตอร์บางตัวจะแรงบิดไม่พอจนไม่ขยับ ("dead zone") สูงกว่า ~60 บอร์ดแบบ L298N ราคาประหยัดอาจเกิดไฟฟ้ากระตุกจน H-bridge สลับสถานะกลางคันขณะกดปุ่มค้างอยู่ ทำให้ล้อกลับทิศ - นี่คือปัญหาฮาร์ดแวร์/กระแสไฟ ไม่ใช่บั๊กโค้ด ปรับ trim ทีละน้อย (&plusmn;0.05-0.1)</div></div>

        <div class="comp-links">
          <a href="https://github.com/eai-spsm/M.5-Classwork" target="_blank" rel="noopener" class="event-fb"><i class="bi bi-github"></i><span>ดูซอร์สโค้ดบน GitHub</span></a>
        </div>
      `,
    },
  },

  "basic-python": {
    icon: "bi-code-slash",
    backAnchor: "m4",
    en: {
      eyebrow: "M.4 · Reports & Docs",
      date: "Semester 1",
      title: "Basic Python - From print() to a GUI Capstone",
      meta: "A tutorial-style walkthrough of what an M.4 student learns week by week, ending in two final projects.",
      body: `
        <p>This is a guide to what M.4 covers over 11 weeks of Basic Python (written and run in VS Code) - the concepts a fresh student needs going in, in the order they're normally taught, ending in a terminal final exam and a GUI capstone project.</p>

        <h3>Weeks 1-2: Printing and Getting Input</h3>
        <p><code>print()</code> is the first tool - it needs to display text mixed with variable values, either with f-strings (<code>f"score: {score}"</code>) or older <code>%</code>-style formatting. The next hurdle is <code>input()</code>: it always returns a string, even if the user types a number, so anything meant to be used in math has to be cast with <code>int()</code> or <code>float()</code> first. <code>type()</code> is a useful habit here - printing the type of a value after a calculation is the fastest way to catch a str-instead-of-int mistake before it causes a crash somewhere else. The <code>math</code> module (<code>math.pi</code>, <code>math.sqrt</code>) shows up here too, as the first standard-library import.</p>

        <h3>Week 3: Lists</h3>
        <p>Lists hold an ordered, mutable collection of values, accessed by index (<code>students[0]</code>) and negative index (<code>students[-1]</code> for the last item). Key operations to know: <code>.append()</code> to add, <code>.sort()</code> to order in place, and slicing (<code>students[1:3]</code>) to pull out a sub-range. At this stage in the course, loops haven't been introduced yet, so working with a list still means addressing each item by its index directly.</p>

        <h3>Week 4: Conditionals</h3>
        <p><code>if</code>/<code>elif</code>/<code>else</code> branches on a condition, and the two things worth being deliberate about are comparison operators (<code>==</code> for equality, not <code>=</code> which assigns) and combining conditions with <code>and</code>/<code>or</code> - each side of <code>and</code>/<code>or</code> needs its own full comparison (<code>x &gt; 0 and y &gt; 0</code>, not <code>x and y &gt; 0</code>) to actually check both values. Common exercises at this stage: grade-band lookups (a score maps to a letter grade through a chain of <code>elif</code>s), unit conversions, and tiered pricing/discount calculators.</p>

        <h3>Week 5: Loops</h3>
        <p><code>for</code> loops step through a known range or sequence (<code>for i in range(10)</code>); <code>while</code> loops repeat until a condition becomes false, which is the right tool when you don't know in advance how many times you'll repeat (like "keep asking until the user types 'q'"). <code>break</code> exits a loop early, <code>continue</code> skips to the next iteration. Loops are also where pattern-printing exercises show up - printing a triangle or pyramid of asterisks by combining an outer loop (which row) with an inner loop or string multiplication (<code>"*" * n</code>) for how many symbols that row gets.</p>

        <h3>Week 6: Functions</h3>
        <p>A function (<code>def name(params):</code>) packages logic that gets reused instead of copy-pasted - the calculator and BMI-checker style exercises here are less about the math and more about practicing parameters in, a <code>return</code> value out. Worth knowing early: a variable created inside a function only exists inside that function (local scope) unless it's explicitly passed in or returned.</p>

        <h3>Week 7: Tuples &amp; Dictionaries</h3>
        <p>A tuple is like a list but immutable (can't be changed after creation) - good for fixed groupings like coordinates. A dictionary stores key-value pairs (<code>student["name"]</code> instead of an index number) and is the natural fit for lookups, like mapping a year to a zodiac animal or a weekday number to its name. <code>dict.get(key, default)</code> is worth knowing here - it looks up a key but returns a fallback instead of crashing if the key doesn't exist yet, which is exactly what you need when building up a running count or tally.</p>

        <h3>Week 8: Object-Oriented Programming</h3>
        <p>A class is a blueprint (<code>class Employee:</code>), <code>__init__</code> is the constructor that runs when a new object is created, and <code>self</code> refers to that specific object's own data. The instinct to build is usually something with state that changes over time - an employee with a salary, a game character with HP - since that's where the value of bundling data and behavior together (rather than passing a dozen separate variables around) actually becomes visible.</p>

        <h3>Weeks 9-11: Tkinter GUI</h3>
        <p>Tkinter is Python's built-in GUI toolkit - no extra install needed. The core idea is event-driven programming: instead of code running top to bottom once, you build a window full of widgets (<code>Label</code>, <code>Button</code>, <code>Entry</code>), and each one's behavior is a callback function that only runs when the user interacts with it. Layout can be positioned three ways - <code>.place(x=, y=)</code> for exact pixel coordinates, <code>.grid()</code> for a row/column table layout, or <code>.pack()</code> to stack widgets - and most small projects end up mixing more than one.</p>

        <h3>Final Exam</h3>
        <p>Two terminal programs, done under exam conditions:</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Task</th><th>What it needs</th></tr></thead>
          <tbody>
            <tr><td>ATM system</td><td>A functional login flow plus withdraw and deposit - accounts stored in a dictionary, balance updated in place, and input validated so a withdrawal can't exceed the current balance</td></tr>
            <tr><td>Filled triangle</td><td>A loop-printed triangle of asterisks, built the same way as the Week 5 pattern exercises - an outer loop for rows, an inner loop (or string multiplication) for how many <code>*</code> characters each row prints</td></tr>
          </tbody>
        </table></div>

        <h3>Capstone Project: A Real GUI App</h3>
        <p>The course's actual final project is a full Tkinter desktop application, not just a terminal script - a study planner ("My Notion" Planner) with a to-do list and event scheduler side by side. It covers everything the GUI weeks built toward at once: a login screen, a <code>Treeview</code> table for listing tasks, a pop-up calendar for picking due dates, color-coded priority levels, and saving/loading each user's data to a JSON file so it's still there the next time the app opens.</p>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div>Any project that reads or writes files (JSON save data, image assets for buttons, a database) breaks the moment it's opened from a different folder if the path is hardcoded. Build paths relative to the script itself (Python's <code>os.path.dirname(__file__)</code>/<code>pathlib</code>) rather than typing a fixed folder path, so the project still runs after you move it or hand it to someone else.</div></div>

        <h3>Where to Go Next</h3>
        <p>Once these fundamentals feel comfortable, the natural next step is a project with a bit more scope than a single-file exercise - something with real persistence, multiple screens, or actual game logic. A few good next builds: a terminal card game for practicing turn-based logic and data structures, a small Tkinter point-of-sale system with a cart, tax calculation, and CSV export, or a countdown-timer app in both a GUI and terminal version. For anyone who wants to go further into how things actually get secured, look at basic password hashing and encryption concepts (why plain <code>random</code> isn't safe for anything security-related, what salting a password actually does). Alongside building projects, working through problems on <a href="https://leetcode.com/" target="_blank" rel="noopener">LeetCode</a> is the standard way to get faster and more comfortable with core data structures and algorithms outside of a specific project's context.</p>
      `,
    },
    th: {
      eyebrow: "ม.4 · งานในชั้นเรียน",
      date: "เทอม 1",
      title: "Python พื้นฐาน - จาก print() สู่โปรเจกต์ GUI",
      meta: "แนวทางสอนแบบทีละสัปดาห์ของนักเรียน ม.4 จนถึงโปรเจกต์จบสองชิ้น",
      body: `
        <p>นี่คือแนวทางของสิ่งที่ ม.4 เรียนตลอด 11 สัปดาห์ในวิชา Python พื้นฐาน (เขียนและรันใน VS Code) - แนวคิดที่นักเรียนใหม่ต้องรู้ตั้งแต่ต้น เรียงตามลำดับที่สอนจริง จบด้วยสอบปลายภาคแบบ terminal และโปรเจกต์ปิดคอร์สแบบ GUI</p>

        <h3>สัปดาห์ 1-2: การพิมพ์และรับค่า</h3>
        <p><code>print()</code> คือเครื่องมือแรก - ต้องแสดงข้อความผสมกับค่าตัวแปร ไม่ว่าจะด้วย f-string (<code>f"score: {score}"</code>) หรือการฟอร์แมตแบบ <code>%</code> รุ่นเก่า อุปสรรคถัดไปคือ <code>input()</code>: มันคืนค่าเป็น string เสมอ แม้ผู้ใช้จะพิมพ์ตัวเลขก็ตาม ดังนั้นค่าที่จะเอาไปคำนวณต้องแปลงด้วย <code>int()</code> หรือ <code>float()</code> ก่อน <code>type()</code> เป็นนิสัยที่มีประโยชน์ตรงนี้ - พิมพ์ประเภทของค่าหลังคำนวณคือวิธีที่เร็วที่สุดในการจับข้อผิดพลาดแบบ str แทนที่จะเป็น int ก่อนที่มันจะไปพังที่อื่น โมดูล <code>math</code> (<code>math.pi</code>, <code>math.sqrt</code>) ก็โผล่มาตรงนี้เช่นกัน เป็นการ import จาก standard library ครั้งแรก</p>

        <h3>สัปดาห์ 3: List</h3>
        <p>List เก็บชุดค่าที่เรียงลำดับและแก้ไขได้ เข้าถึงด้วย index (<code>students[0]</code>) และ index ติดลบ (<code>students[-1]</code> สำหรับตัวสุดท้าย) การใช้งานหลักที่ควรรู้: <code>.append()</code> เพื่อเพิ่ม, <code>.sort()</code> เพื่อจัดเรียงในที่เดิม และการ slicing (<code>students[1:3]</code>) เพื่อดึงช่วงย่อยออกมา ในจุดนี้ของคอร์สยังไม่มีการสอนลูป ดังนั้นการทำงานกับ list จึงยังหมายถึงการเข้าถึงแต่ละตัวผ่าน index โดยตรง</p>

        <h3>สัปดาห์ 4: เงื่อนไข</h3>
        <p><code>if</code>/<code>elif</code>/<code>else</code> แตกกิ่งตามเงื่อนไข และสองเรื่องที่ต้องระวังคือตัวดำเนินการเปรียบเทียบ (<code>==</code> สำหรับความเท่ากัน ไม่ใช่ <code>=</code> ที่ใช้กำหนดค่า) และการรวมเงื่อนไขด้วย <code>and</code>/<code>or</code> - แต่ละฝั่งของ <code>and</code>/<code>or</code> ต้องเป็นการเปรียบเทียบเต็มรูปแบบของตัวเอง (<code>x &gt; 0 and y &gt; 0</code> ไม่ใช่ <code>x and y &gt; 0</code>) เพื่อให้เช็คทั้งสองค่าจริง ๆ แบบฝึกหัดที่พบบ่อยในช่วงนี้: การค้นหาเกรดตามช่วงคะแนน (คะแนนแปลงเป็นเกรดผ่านชุด <code>elif</code>) การแปลงหน่วย และการคำนวณราคา/ส่วนลดแบบขั้นบันได</p>

        <h3>สัปดาห์ 5: ลูป</h3>
        <p>ลูป <code>for</code> วนตามช่วงหรือลำดับที่รู้ล่วงหน้า (<code>for i in range(10)</code>); ลูป <code>while</code> วนซ้ำจนกว่าเงื่อนไขจะเป็นเท็จ ซึ่งเป็นเครื่องมือที่ถูกต้องเมื่อไม่รู้ล่วงหน้าว่าจะวนกี่รอบ (เช่น "ถามซ้ำจนกว่าผู้ใช้จะพิมพ์ 'q'") <code>break</code> ออกจากลูปก่อนกำหนด <code>continue</code> ข้ามไปรอบถัดไป ลูปยังเป็นจุดที่แบบฝึกหัดพิมพ์ลวดลายโผล่มาด้วย - พิมพ์สามเหลี่ยมหรือปิรามิดของเครื่องหมายดอกจันโดยรวมลูปนอก (แถวไหน) กับลูปในหรือการคูณ string (<code>"*" * n</code>) เพื่อกำหนดว่าแถวนั้นมีกี่สัญลักษณ์</p>

        <h3>สัปดาห์ 6: ฟังก์ชัน</h3>
        <p>ฟังก์ชัน (<code>def name(params):</code>) รวมโค้ดที่ถูกใช้ซ้ำแทนการก็อปวางซ้ำ ๆ - แบบฝึกหัดเครื่องคิดเลขและเช็ค BMI ในช่วงนี้เน้นการฝึกส่งพารามิเตอร์เข้า คืนค่าด้วย <code>return</code> ออก มากกว่าเน้นที่คณิตศาสตร์ สิ่งที่ควรรู้ไว้แต่เนิ่น ๆ: ตัวแปรที่สร้างในฟังก์ชันจะมีอยู่แค่ในฟังก์ชันนั้น (local scope) เว้นแต่จะส่งเข้าไปหรือคืนค่าออกมาอย่างชัดเจน</p>

        <h3>สัปดาห์ 7: Tuple และ Dictionary</h3>
        <p>Tuple คล้าย list แต่แก้ไขไม่ได้หลังสร้าง (immutable) - เหมาะกับกลุ่มค่าคงที่อย่างพิกัด Dictionary เก็บคู่ key-value (<code>student["name"]</code> แทนหมายเลข index) และเหมาะกับการค้นหาโดยธรรมชาติ เช่น แปลงปีเป็นสัตว์ประจำนักษัตร หรือหมายเลขวันเป็นชื่อวัน <code>dict.get(key, default)</code> ควรรู้ไว้ตรงนี้ - มันค้นหา key แต่คืนค่า default แทนที่จะพังถ้ายังไม่มี key นั้น ซึ่งเหมาะมากเวลากำลังนับสะสมหรือทำ tally</p>

        <h3>สัปดาห์ 8: Object-Oriented Programming</h3>
        <p>Class คือพิมพ์เขียว (<code>class Employee:</code>) <code>__init__</code> คือ constructor ที่รันตอนสร้าง object ใหม่ และ <code>self</code> อ้างถึงข้อมูลของ object นั้นเอง สัญชาตญาณในการสร้างมักเป็นสิ่งที่มีสถานะเปลี่ยนแปลงตามเวลา - พนักงานที่มีเงินเดือน ตัวละครเกมที่มี HP - เพราะตรงนั้นเองที่คุณค่าของการรวมข้อมูลกับพฤติกรรมเข้าด้วยกัน (แทนที่จะส่งตัวแปรแยกกันสิบกว่าตัว) เริ่มเห็นผลจริง</p>

        <h3>สัปดาห์ 9-11: Tkinter GUI</h3>
        <p>Tkinter คือชุดเครื่องมือ GUI ในตัวของ Python - ไม่ต้องติดตั้งเพิ่ม แนวคิดหลักคือ event-driven programming: แทนที่โค้ดจะรันจากบนลงล่างครั้งเดียว จะสร้างหน้าต่างที่เต็มไปด้วย widget (<code>Label</code>, <code>Button</code>, <code>Entry</code>) แต่ละตัวมีพฤติกรรมเป็น callback function ที่รันเฉพาะตอนผู้ใช้โต้ตอบกับมัน จัดวางเลย์เอาต์ได้สามแบบ - <code>.place(x=, y=)</code> สำหรับพิกัดพิกเซลที่แน่นอน, <code>.grid()</code> สำหรับเลย์เอาต์แบบตาราง แถว/คอลัมน์ หรือ <code>.pack()</code> สำหรับเรียง widget ต่อกัน - และโปรเจกต์เล็ก ๆ ส่วนใหญ่มักผสมมากกว่าหนึ่งแบบ</p>

        <h3>สอบปลายภาค</h3>
        <p>โปรแกรม terminal สองชิ้น ทำภายใต้เงื่อนไขการสอบ:</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>งาน</th><th>สิ่งที่ต้องใช้</th></tr></thead>
          <tbody>
            <tr><td>ระบบ ATM</td><td>ระบบล็อกอินที่ใช้งานได้จริง บวกกับถอนและฝากเงิน - บัญชีเก็บใน dictionary อัปเดตยอดคงเหลือในที่เดิม และตรวจสอบค่าที่รับเข้ามาเพื่อไม่ให้ถอนเกินยอดคงเหลือปัจจุบัน</td></tr>
            <tr><td>สามเหลี่ยมทึบ</td><td>สามเหลี่ยมของเครื่องหมายดอกจันที่พิมพ์ด้วยลูป สร้างแบบเดียวกับแบบฝึกหัดลวดลายในสัปดาห์ 5 - ลูปนอกสำหรับแถว ลูปในหรือการคูณ string สำหรับจำนวนตัวอักษร <code>*</code> ในแต่ละแถว</td></tr>
          </tbody>
        </table></div>

        <h3>โปรเจกต์ปิดคอร์ส: แอป GUI จริง</h3>
        <p>โปรเจกต์จบคอร์สจริง ๆ คือแอปเดสก์ท็อป Tkinter เต็มรูปแบบ ไม่ใช่แค่สคริปต์ terminal - แอปวางแผนการเรียน ("My Notion" Planner) ที่มีทั้งรายการสิ่งที่ต้องทำและตารางกิจกรรมอยู่ด้วยกัน มันครอบคลุมทุกอย่างที่สัปดาห์ GUI ปูทางไว้พร้อมกัน: หน้าล็อกอิน, ตาราง <code>Treeview</code> สำหรับแสดงรายการงาน, ปฏิทินป๊อปอัปสำหรับเลือกวันครบกำหนด, ระดับความสำคัญที่ไล่สี และการบันทึก/โหลดข้อมูลของแต่ละผู้ใช้ลงไฟล์ JSON เพื่อให้ข้อมูลยังอยู่เมื่อเปิดแอปครั้งถัดไป</p>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div>โปรเจกต์ใดก็ตามที่อ่านหรือเขียนไฟล์ (ข้อมูล JSON, รูปภาพสำหรับปุ่ม, ฐานข้อมูล) จะพังทันทีที่เปิดจากโฟลเดอร์อื่น ถ้า path ถูก hardcode ไว้ ให้สร้าง path แบบอิงกับตำแหน่งของสคริปต์เอง (<code>os.path.dirname(__file__)</code>/<code>pathlib</code> ของ Python) แทนการพิมพ์ path ตายตัว เพื่อให้โปรเจกต์ยังรันได้หลังย้ายไฟล์หรือส่งต่อให้คนอื่น</div></div>

        <h3>ก้าวต่อไป</h3>
        <p>เมื่อพื้นฐานเหล่านี้คล่องแล้ว ก้าวต่อไปตามธรรมชาติคือโปรเจกต์ที่มีขอบเขตกว้างกว่าแบบฝึกหัดไฟล์เดียว - อะไรที่มีการบันทึกข้อมูลจริง หลายหน้าจอ หรือมีตรรกะเกมจริง ๆ ตัวอย่างโปรเจกต์ถัดไปที่ดี: เกมไพ่แบบ terminal สำหรับฝึกตรรกะแบบผลัดตาเล่นและโครงสร้างข้อมูล ระบบขายหน้าร้าน (POS) เล็ก ๆ ด้วย Tkinter ที่มีตะกร้าสินค้า คำนวณภาษี และ export เป็น CSV หรือแอปนับถอยหลังทั้งเวอร์ชัน GUI และ terminal สำหรับใครที่อยากลงลึกเรื่องความปลอดภัยจริง ๆ ให้ศึกษาแนวคิดพื้นฐานของ password hashing และการเข้ารหัส (ทำไม <code>random</code> ธรรมดาถึงไม่ปลอดภัยสำหรับงานด้านความปลอดภัย และการ salt รหัสผ่านทำอะไรกันแน่) นอกจากการสร้างโปรเจกต์ การฝึกทำโจทย์บน <a href="https://leetcode.com/" target="_blank" rel="noopener">LeetCode</a> ก็เป็นวิธีมาตรฐานในการฝึกความเร็วและความคุ้นเคยกับโครงสร้างข้อมูลและอัลกอริทึมพื้นฐาน นอกเหนือจากบริบทของโปรเจกต์ใดโปรเจกต์หนึ่ง</p>
      `,
    },
  },

  "physics-robotics": {
    icon: "bi-gear-fill",
    backAnchor: "m4",
    en: {
      eyebrow: "M.4 · Reports & Docs",
      date: "Semester 1",
      title: "Physics in Robotics - ESP32 Differential-Drive Capstone",
      meta: "Kinematics-driven autonomous navigation on a custom Onshape-designed robot.",
      body: `
        <p>Built for the FIBO-KMUTT "Physics in Robot Technology" course (&#3623;30256): a custom differential-drive robot, chassis and extension parts designed in Onshape and 3D-printed. The course ties classical mechanics directly to a physical machine - every equation from class (circumference, angular velocity, kinematics) turns into an actual line of firmware that has to get the robot to the right place. No git history - this is a local coursework folder, not a published repo.</p>

        <h3>Hardware</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Component</th><th>Role</th></tr></thead>
          <tbody>
            <tr><td>ESP32 microcontroller</td><td>Main controller; uses hardware <code>Serial2</code> for motor comms and the ESP32-specific <code>ESP32Servo</code> library (core Arduino <code>Servo.h</code> doesn't support ESP32 timers)</td></tr>
            <tr><td>2x Dynamixel-protocol smart servos</td><td>Drive wheels (IDs 1/2), half-duplex RS485 via a direction pin, 115200 baud</td></tr>
            <tr><td>Auxiliary hobby servo</td><td>GPIO 16, mission-specific mechanism</td></tr>
            <tr><td>LiPo battery pack</td><td>Onboard power for the controller and both drive servos - see battery caution below</td></tr>
            <tr><td>3D-printed chassis + wheels</td><td>Designed in Onshape, exported as STEP files</td></tr>
          </tbody>
        </table></div>

        <h3>Project Setup</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Item</th><th>Detail</th></tr></thead>
          <tbody>
            <tr><td>Library</td><td><code>Motor.h</code>, <code>Motor.cpp</code>, <code>MotorV2.h</code> - kept in a <code>src</code> folder placed alongside the <code>.ino</code> file, which is how the Arduino IDE auto-detects and compiles a sketch's local library files</td></tr>
            <tr><td>ESP32 Board package</td><td>Version <strong>2.0.17</strong>, installed through the Arduino IDE's Board Manager (Tools &rarr; Board &rarr; Boards Manager, search "esp32")</td></tr>
          </tbody>
        </table></div>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>Board specification:</strong> the repo's README names the controller only as "an ESP32," and the ESP32 Board package version (2.0.17) is documented above - but there's still no exact board model, pin-out diagram, or datasheet link recorded anywhere in the project. Different ESP32 dev boards (WROOM-32, DevKit V1, S3, C3, etc.) can differ in pin count, available UARTs, and voltage tolerances - the exact board actually used should be documented in the repo's README so the wiring and firmware can be reproduced or debugged later without guessing.</div></div>

        <h3>Motor Protocol: Dynamixel Protocol 2.0</h3>
        <p>The two drive wheels aren't plain DC motors - they're Dynamixel-protocol smart servos, which take a digital command over a serial line instead of a raw voltage, and can report back their own temperature, load, and position. The <code>Motor</code> library actually implements two generations of that protocol side by side. <code>Motor.h</code> exposes a legacy-style API (register map named like AX/RX-series Dynamixel EEPROM/RAM tables), but <code>MOTOR::turnWheel()</code> is a thin wrapper that calls straight into <code>MotorV2.h</code>'s <code>turn()</code> - meaning every <code>.ino</code> sketch actually drives the newer Protocol 2.0 path:</p>
        <pre class="code-block"><code>// MotorV2.h - packet framing: 0xFF 0xFF 0xFD start bytes + CRC-16/IBM-SDLC
int Speed = RPM / 0.229;           // 0.229 rev/min per unit - X-series velocity resolution
if (SIDE == RIGHT) Speed = -Speed;  // mirror direction for the opposite wheel
// written as a 4-byte little-endian value to register 0x68 (goal velocity)</code></pre>
        <p>Direction control for the RS485 half-duplex line is a manual <code>digitalWrite(4, 1)</code> before every write and <code>digitalWrite(4, 0)</code> after, to switch the transceiver between transmit and receive - RS485 is a shared two-wire line, so both motors can only listen or talk at any given moment, never both.</p>

        <h3>Kinematics: Turning Distance and Angle into Motor Speed</h3>
        <p>The robot has no built-in sense of "how far have I gone" - every move is open-loop, meaning the firmware has to calculate exactly how fast to spin the wheels and for how long, purely from the geometry, and trust that the motors do it accurately. The capstone mission (<code>Task Final.ino</code>) converts every straight-line move and pivot turn through one constant, derived from the wheel's own circumference:</p>
        <pre class="code-block"><code>const float wheelr = 3.0;     // wheel radius, cm
const float track = 15.0;     // wheelbase, cm
const float PI_VAL = 3.14159;
const int t = 3000;           // execution window, ms
float rpm_unit = (1.0/(2.0*PI_VAL*wheelr)) * (60000.0/t);
// distance_cm * rpm_unit -> RPM command for a straight move</code></pre>
        <p>In plain terms: the wheel's circumference tells you how far one full rotation moves the robot, so dividing the target distance by that circumference gives the number of rotations needed, and dividing by the time window converts that into a speed command. Pivot turns work the same way but off the wheelbase (the distance between the two wheels) instead of the wheel radius - turning in place traces an arc equal to a fraction of the wheelbase's own circumference, e.g. a 90&deg; pivot: <code>dist90 = (2.0*PI_VAL*track) * 0.25</code>, then drive one wheel at that RPM while the other holds 0.</p>
        <p>The simpler <code>Task Circular Motion.ino</code> drives one full 360&deg; loop using the same inner/outer-wheel RPM formula, but approximates &pi; as a bare <code>3</code> in the divisor rather than using <code>PI_VAL</code> - a precision shortcut not present in the later, more careful capstone code.</p>

        <h3>The Final Mission</h3>
        <p>The capstone task chains 14 stages entirely from <code>setup()</code> (with <code>loop()</code> left empty by design): straight moves ranging from 5cm to 47cm, four 90&deg; pivot turns, one precise 60&deg; turn, and a differential arc segment through a sequence of checkpoints - the robot has to navigate the full course autonomously with no live correction, so every stage's distance and angle has to be right the first time.</p>
        <figure class="report-figure">
          <img src="assets/img/final%20task.png" alt="Final mission course layout and required checkpoints">
          <figcaption>The final mission course - the checkpoint sequence and turns the robot has to complete autonomously.</figcaption>
        </figure>

        <h3>Chassis Design in Onshape</h3>
        <p>The chassis, wheels, and sensor-extension arm were modeled in Onshape before being 3D-printed - sketching the 2D profile, extruding it into a solid body, filleting sharp edges so printed parts don't crack under stress, then mating the parts together (wheel to axle, chassis to extension) into one assembly that has to actually fit the real servos and battery once printed.</p>
        <figure class="report-figure">
          <img src="assets/img/CAD.png" alt="Onshape CAD assembly of the robot chassis, wheels, and extension mount">
          <figcaption>Onshape CAD assembly - chassis, wheels, and the sensor/extension mount, before 3D printing.</figcaption>
        </figure>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>Lithium battery caution:</strong> LiPo packs are the fire-risk component of this build. Never puncture, crush, or short the terminals; never charge an unattended or swollen/damaged pack; always charge on a fireproof surface (a LiPo bag or ceramic tile, not a desk); double-check connector polarity before plugging in, since reversed polarity can ignite the pack instantly; and disconnect the battery when the robot isn't actively being used or charged, since running it down to empty repeatedly shortens its life and increases the risk of it swelling.</div></div>
      `,
    },
    th: {
      eyebrow: "ม.4 · งานในชั้นเรียน",
      date: "เทอม 1",
      title: "ฟิสิกส์ในหุ่นยนต์ - โปรเจกต์จบ Differential-Drive ด้วย ESP32",
      meta: "การนำทางอัตโนมัติที่ขับเคลื่อนด้วยจลนศาสตร์ บนหุ่นยนต์ที่ออกแบบเองด้วย Onshape",
      body: `
        <p>สร้างขึ้นสำหรับวิชา "ฟิสิกส์ในเทคโนโลยีหุ่นยนต์" ของ FIBO-KMUTT (&#3623;30256): หุ่นยนต์ differential-drive ที่ออกแบบเอง แชสซีและชิ้นส่วนต่อขยายออกแบบใน Onshape แล้วพิมพ์สามมิติ วิชานี้ผูกกลศาสตร์คลาสสิกเข้ากับเครื่องจักรจริงโดยตรง - ทุกสมการจากในห้องเรียน (เส้นรอบวง ความเร็วเชิงมุม จลนศาสตร์) กลายเป็นโค้ด firmware จริงที่ต้องพาหุ่นยนต์ไปถึงตำแหน่งที่ถูกต้อง ไม่มีประวัติ git - นี่คือโฟลเดอร์งานในชั้นเรียนแบบ local ไม่ใช่ repo ที่เผยแพร่</p>

        <h3>ฮาร์ดแวร์</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>อุปกรณ์</th><th>บทบาท</th></tr></thead>
          <tbody>
            <tr><td>ไมโครคอนโทรลเลอร์ ESP32</td><td>ตัวควบคุมหลัก ใช้ <code>Serial2</code> ของฮาร์ดแวร์สำหรับสื่อสารกับมอเตอร์ และไลบรารี <code>ESP32Servo</code> เฉพาะของ ESP32 (<code>Servo.h</code> ของ Arduino หลักไม่รองรับ timer ของ ESP32)</td></tr>
            <tr><td>เซอร์โวอัจฉริยะโปรโตคอล Dynamixel 2 ตัว</td><td>ล้อขับเคลื่อน (ID 1/2) สื่อสารแบบ half-duplex RS485 ผ่านขา direction ที่ 115200 baud</td></tr>
            <tr><td>เซอร์โวเสริม</td><td>GPIO 16 กลไกเฉพาะภารกิจ</td></tr>
            <tr><td>แบตเตอรี่ LiPo</td><td>จ่ายไฟให้ตัวควบคุมและเซอร์โวขับเคลื่อนทั้งสอง - ดูคำเตือนเรื่องแบตเตอรี่ด้านล่าง</td></tr>
            <tr><td>แชสซีและล้อพิมพ์สามมิติ</td><td>ออกแบบใน Onshape แล้ว export เป็นไฟล์ STEP</td></tr>
          </tbody>
        </table></div>

        <h3>การตั้งค่าโปรเจกต์</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>รายการ</th><th>รายละเอียด</th></tr></thead>
          <tbody>
            <tr><td>ไลบรารี</td><td><code>Motor.h</code>, <code>Motor.cpp</code>, <code>MotorV2.h</code> - เก็บไว้ในโฟลเดอร์ <code>src</code> ที่วางคู่กับไฟล์ <code>.ino</code> ซึ่งเป็นวิธีที่ Arduino IDE ตรวจจับและคอมไพล์ไฟล์ไลบรารีเฉพาะของ sketch นั้นโดยอัตโนมัติ</td></tr>
            <tr><td>ESP32 Board package</td><td>เวอร์ชัน <strong>2.0.17</strong> ติดตั้งผ่าน Board Manager ของ Arduino IDE (Tools &rarr; Board &rarr; Boards Manager ค้นหา "esp32")</td></tr>
          </tbody>
        </table></div>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>ข้อมูลระบุบอร์ด:</strong> README ของ repo ระบุตัวควบคุมแค่ว่าเป็น "an ESP32" และเวอร์ชันของ ESP32 Board package (2.0.17) ก็ระบุไว้ด้านบนแล้ว - แต่ยังไม่มีการบันทึกรุ่นบอร์ดที่แน่ชัด แผนภาพขา หรือลิงก์ datasheet ไว้ที่ไหนในโปรเจกต์เลย บอร์ด ESP32 dev แต่ละรุ่น (WROOM-32, DevKit V1, S3, C3 ฯลฯ) อาจต่างกันในจำนวนขา, UART ที่ใช้ได้ และค่าความทนแรงดัน - บอร์ดที่ใช้จริงควรถูกบันทึกไว้ใน README ของ repo เพื่อให้สามารถต่อสายและรัน firmware ซ้ำหรือดีบั๊กได้ในอนาคตโดยไม่ต้องเดา</div></div>

        <h3>โปรโตคอลมอเตอร์: Dynamixel Protocol 2.0</h3>
        <p>ล้อขับเคลื่อนทั้งสองไม่ใช่มอเตอร์ DC ธรรมดา - แต่เป็นเซอร์โวอัจฉริยะโปรโตคอล Dynamixel ที่รับคำสั่งดิจิทัลผ่านสายซีเรียลแทนแรงดันไฟดิบ และรายงานอุณหภูมิ โหลด และตำแหน่งของตัวเองกลับมาได้ ไลบรารี <code>Motor</code> ทำโปรโตคอลสองรุ่นควบคู่กันจริง ๆ <code>Motor.h</code> เปิด API แบบเก่า (ชื่อ register map ตามตาราง EEPROM/RAM ของ Dynamixel รุ่น AX/RX) แต่ <code>MOTOR::turnWheel()</code> เป็นแค่ wrapper บาง ๆ ที่เรียกตรงไปยัง <code>turn()</code> ใน <code>MotorV2.h</code> - หมายความว่าทุก sketch <code>.ino</code> ขับเคลื่อนผ่านเส้นทาง Protocol 2.0 รุ่นใหม่จริง ๆ:</p>
        <pre class="code-block"><code>// MotorV2.h - packet framing: 0xFF 0xFF 0xFD start bytes + CRC-16/IBM-SDLC
int Speed = RPM / 0.229;           // 0.229 rev/min per unit - X-series velocity resolution
if (SIDE == RIGHT) Speed = -Speed;  // mirror direction for the opposite wheel
// written as a 4-byte little-endian value to register 0x68 (goal velocity)</code></pre>
        <p>การควบคุมทิศทางของสาย RS485 half-duplex ทำแบบ manual ด้วย <code>digitalWrite(4, 1)</code> ก่อนเขียนทุกครั้ง และ <code>digitalWrite(4, 0)</code> หลังเขียน เพื่อสลับ transceiver ระหว่างส่งกับรับ - RS485 เป็นสายสองเส้นที่ใช้ร่วมกัน ดังนั้นมอเตอร์ทั้งสองตัวจะฟังหรือพูดได้ทีละอย่างเท่านั้น ไม่มีทางทำทั้งสองอย่างพร้อมกัน</p>

        <h3>จลนศาสตร์: แปลงระยะทางและมุมเป็นความเร็วมอเตอร์</h3>
        <p>หุ่นยนต์ไม่มีความรู้สึกในตัวว่า "ไปแล้วไกลแค่ไหน" - ทุกการเคลื่อนที่เป็นแบบ open-loop หมายความว่า firmware ต้องคำนวณให้แม่นยำว่าล้อควรหมุนเร็วแค่ไหนและนานเท่าไหร่ โดยอาศัยเรขาคณิตล้วน ๆ แล้วเชื่อว่ามอเตอร์จะทำได้แม่นยำ ภารกิจปิดคอร์ส (<code>Task Final.ino</code>) แปลงทุกการเคลื่อนที่แบบเส้นตรงและการหมุนอยู่กับที่ผ่านค่าคงที่ตัวเดียว ที่มาจากเส้นรอบวงของล้อเอง:</p>
        <pre class="code-block"><code>const float wheelr = 3.0;     // wheel radius, cm
const float track = 15.0;     // wheelbase, cm
const float PI_VAL = 3.14159;
const int t = 3000;           // execution window, ms
float rpm_unit = (1.0/(2.0*PI_VAL*wheelr)) * (60000.0/t);
// distance_cm * rpm_unit -> RPM command for a straight move</code></pre>
        <p>พูดง่าย ๆ คือ เส้นรอบวงของล้อบอกว่าหนึ่งรอบเต็มพาหุ่นยนต์ไปได้ไกลแค่ไหน ดังนั้นการหารระยะทางเป้าหมายด้วยเส้นรอบวงนั้นจะได้จำนวนรอบที่ต้องหมุน และการหารด้วยช่วงเวลาจะแปลงเป็นคำสั่งความเร็ว การหมุนอยู่กับที่ทำงานแบบเดียวกันแต่อิงกับ wheelbase (ระยะห่างระหว่างล้อทั้งสอง) แทนรัศมีล้อ - การหมุนอยู่กับที่จะลากส่วนโค้งเท่ากับสัดส่วนหนึ่งของเส้นรอบวงของ wheelbase เอง เช่น การหมุน 90&deg;: <code>dist90 = (2.0*PI_VAL*track) * 0.25</code> แล้วขับล้อข้างหนึ่งที่ RPM นั้นในขณะที่อีกข้างค้างไว้ที่ 0</p>
        <p><code>Task Circular Motion.ino</code> ที่ง่ายกว่าขับวนครบ 360&deg; หนึ่งรอบด้วยสูตร RPM ล้อในและล้อนอกแบบเดียวกัน แต่ประมาณค่า &pi; เป็นเลข <code>3</code> เปล่า ๆ ในตัวหาร แทนที่จะใช้ <code>PI_VAL</code> - เป็นทางลัดด้านความแม่นยำที่ไม่มีในโค้ดปิดคอร์สรุ่นหลังที่รอบคอบกว่า</p>

        <h3>ภารกิจสุดท้าย</h3>
        <p>ภารกิจปิดคอร์สร้อยเรียง 14 ขั้นตอนทั้งหมดจาก <code>setup()</code> (โดยจงใจปล่อยให้ <code>loop()</code> ว่างเปล่า): การเคลื่อนที่เส้นตรงตั้งแต่ 5cm ถึง 47cm, การหมุนอยู่กับที่ 90&deg; สี่ครั้ง, การหมุนแม่นยำ 60&deg; หนึ่งครั้ง และช่วงส่วนโค้งแบบ differential ผ่านลำดับจุดตรวจ - หุ่นยนต์ต้องนำทางตลอดเส้นทางแบบอัตโนมัติโดยไม่มีการแก้ไขระหว่างทาง ดังนั้นระยะทางและมุมของทุกขั้นตอนต้องถูกต้องตั้งแต่ครั้งแรก</p>
        <figure class="report-figure">
          <img src="assets/img/final%20task.png" alt="Final mission course layout and required checkpoints">
          <figcaption>เส้นทางภารกิจสุดท้าย - ลำดับจุดตรวจและการหมุนที่หุ่นยนต์ต้องทำให้สำเร็จแบบอัตโนมัติ</figcaption>
        </figure>

        <h3>ออกแบบแชสซีใน Onshape</h3>
        <p>แชสซี ล้อ และแขนต่อขยายสำหรับเซนเซอร์ถูกสร้างแบบใน Onshape ก่อนพิมพ์สามมิติ - ร่างโปรไฟล์ 2 มิติ extrude ให้เป็นวัตถุตัน เติมมุมโค้ง (fillet) เพื่อไม่ให้ชิ้นงานพิมพ์แตกภายใต้แรงกด แล้ว mate ชิ้นส่วนเข้าด้วยกัน (ล้อกับเพลา แชสซีกับส่วนต่อขยาย) เป็นแอสเซมบลีเดียวที่ต้องพอดีกับเซอร์โวและแบตเตอรี่จริงเมื่อพิมพ์ออกมาแล้ว</p>
        <figure class="report-figure">
          <img src="assets/img/CAD.png" alt="Onshape CAD assembly of the robot chassis, wheels, and extension mount">
          <figcaption>แอสเซมบลี CAD ใน Onshape - แชสซี ล้อ และจุดยึดเซนเซอร์/ส่วนต่อขยาย ก่อนพิมพ์สามมิติ</figcaption>
        </figure>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>คำเตือนเรื่องแบตเตอรี่ลิเทียม:</strong> แบตเตอรี่ LiPo คือชิ้นส่วนที่มีความเสี่ยงไฟไหม้ในงานนี้ ห้ามเจาะ บีบ หรือลัดวงจรขั้วเด็ดขาด; ห้ามชาร์จแบตที่ไม่มีคนดูแลหรือบวม/เสียหาย; ชาร์จบนพื้นผิวกันไฟเสมอ (ถุง LiPo หรือกระเบื้องเซรามิก ไม่ใช่บนโต๊ะ); ตรวจสอบขั้วของ connector ให้ถูกต้องก่อนเสียบทุกครั้ง เพราะขั้วกลับด้านทำให้แบตติดไฟได้ทันที; และถอดแบตเตอรี่ออกเมื่อไม่ได้ใช้งานหรือชาร์จหุ่นยนต์อยู่ เพราะการปล่อยให้แบตหมดซ้ำ ๆ จะลดอายุการใช้งานและเพิ่มความเสี่ยงที่แบตจะบวม</div></div>
      `,
    },
  },

  "opencv": {
    icon: "bi-camera-video",
    backAnchor: "m5",
    en: {
      eyebrow: "M.5 · Reports & Docs",
      date: "Semester 1",
      title: "Computer Vision with OpenCV - A Learning Path",
      meta: "A tutorial-style walkthrough from opening a picture to trained face recognition and YOLO detection.",
      body: `
        <p>This is a guide to how OpenCV coursework builds up in practice, stage by stage, based on real coursework (<a href="https://github.com/eai-spsm/M.5-Classwork" target="_blank" rel="noopener">eai-spsm/M.5-Classwork</a>, written and run in VS Code) - starting from just opening a picture and ending with a trained face-recognition system and a fine-tuned object detector.</p>

        <h3>Stage 1: Reading &amp; Displaying</h3>
        <p>Everything starts with loading an image or a video frame into memory and putting it on screen - the "hello world" of the whole subject. A window pops up showing the picture, or for video, a continuous loop pulls one frame at a time from a webcam or file and redraws the window until a key is pressed to quit. Resizing an image before displaying it is one of the first practical lessons, since a full-resolution photo is often bigger than the screen.</p>
        <p><strong>Key commands:</strong> <code>cv2.imread()</code> loads an image file, <code>cv2.imshow()</code> puts it in a window, <code>cv2.waitKey()</code> pauses and listens for a key press, <code>cv2.VideoCapture()</code> opens a webcam or video file, <code>.read()</code> pulls one frame at a time, and <code>.release()</code> frees the camera/file when done.</p>

        <h3>Stage 2: Mouse Events</h3>
        <p>The next step is making the window interactive: attaching a callback that fires whenever the mouse moves, clicks, or is released over the image. This is what lets a program know where on the image the user clicked, which is the building block for click-to-draw shapes, click-and-drag rectangles, or picking a specific pixel to inspect its color. Every mouse-driven exercise follows the same shape - remember the coordinates when the button goes down, keep redrawing a live preview while the mouse moves, and finalize the shape when the button comes back up.</p>
        <p><strong>Key commands:</strong> <code>cv2.setMouseCallback()</code> attaches the click/drag handler to a window; inside it, event codes like <code>cv2.EVENT_LBUTTONDOWN</code>, <code>cv2.EVENT_MOUSEMOVE</code>, and <code>cv2.EVENT_LBUTTONUP</code> tell you what just happened.</p>

        <h3>Stage 3: Crop, Flip, Rotate &amp; Resize</h3>
        <p>Once mouse coordinates or fixed regions are available, basic geometric transforms follow naturally: cropping is just slicing out a rectangular region of the image array, flipping mirrors it horizontally or vertically, and rotating spins it around a center point by some angle. Resizing changes how many pixels represent the image and matters for performance - a smaller frame is much faster to process in real time than a full-resolution one.</p>
        <p><strong>Key commands:</strong> cropping is plain array slicing (no <code>cv2</code> call needed), <code>cv2.flip()</code> mirrors an image, <code>cv2.resize()</code> scales it, and rotation is two steps - <code>cv2.getRotationMatrix2D()</code> builds the rotation matrix, then <code>cv2.warpAffine()</code> applies it to the image.</p>

        <h3>Stage 4: Color Spaces</h3>
        <p>An image isn't just "colored pixels" - it's stored as three stacked channels, and the order matters. OpenCV loads and stores images in BGR order (blue-green-red), not the RGB order most other tools expect - forgetting this is the single most common color bug in the whole subject, showing up as photos looking blue-tinted or orange-tinted for no obvious reason. Beyond BGR/RGB, converting to HSV (hue, saturation, value) makes it much easier to isolate a specific color regardless of lighting, which is what color-based object tracking is usually built on.</p>
        <p><strong>Key commands:</strong> <code>cv2.cvtColor()</code> converts between color spaces (BGR&rarr;Gray, BGR&rarr;HSV, etc.), and <code>cv2.split()</code>/<code>cv2.merge()</code> pull channels apart or put them back together.</p>

        <h3>Stage 5: Thresholding &amp; Edge Detection</h3>
        <p>Thresholding turns a grayscale image into pure black-and-white by picking a cutoff brightness - anything above becomes white, anything below becomes black. A fixed cutoff works when lighting is even; adaptive thresholding recalculates the cutoff separately for each region of the image, which matters when one side of a photo is brighter than the other. Edge detection (most commonly the Canny method) goes a step further: instead of just splitting light from dark, it traces the outlines where brightness changes sharply, which is the basis for finding shapes rather than just isolating regions.</p>
        <p><strong>Key commands:</strong> <code>cv2.threshold()</code> for a fixed cutoff, <code>cv2.adaptiveThreshold()</code> for a per-region cutoff, <code>cv2.GaussianBlur()</code> to smooth noise before edge detection, <code>cv2.Canny()</code> for edge outlines, and <code>cv2.Sobel()</code>/<code>cv2.Laplacian()</code> for raw brightness-gradient detection.</p>

        <h3>Stage 6: Contours</h3>
        <p>Once edges are detected, contours trace them into continuous outlines the program can actually reason about - count how many separate shapes are in an image, measure one's area, or draw a bounding box around it. This is the first point where the program moves from "processing pixels" to "understanding there are distinct objects in this image."</p>
        <p><strong>Key commands:</strong> <code>cv2.findContours()</code> traces the outlines from an edge/threshold image, and <code>cv2.drawContours()</code> draws them back onto a frame for a sanity check.</p>

        <h3>Stage 7: Bitwise Operations &amp; Masking</h3>
        <p>A mask is a black-and-white image used as a stencil - combined with the original photo using bitwise AND/OR/XOR, it can isolate just one region (like a detected face) or blank one out entirely. This is the same idea used later for hiding or highlighting a detected face, or for isolating one color range from the rest of a frame.</p>
        <p><strong>Key commands:</strong> <code>cv2.bitwise_and()</code>, <code>cv2.bitwise_or()</code>, <code>cv2.bitwise_xor()</code>, and <code>cv2.bitwise_not()</code> combine an image with a mask; <code>cv2.inRange()</code> builds a mask directly from a color range (e.g. everything within a given HSV band).</p>

        <h3>Stage 8: Face Detection</h3>
        <p>Face detection answers "is there a face here, and where" using a Haar cascade - a pre-trained classifier (shipped with OpenCV, not trained from scratch) that scans the image at different scales looking for the light/dark contrast patterns typical of a face. It's fast because it rejects obviously-not-a-face regions early and only spends effort on promising areas. Two of OpenCV's built-in cascade files cover this: <code>haarcascade_frontalface_default.xml</code> for faces, and <code>haarcascade_eye_tree_eyeglasses.xml</code> for eyes - both ship with the library itself, no training required to use them. The same technique works for eyes, and can be paired with masking to blur or highlight just the detected region.</p>
        <p><strong>Key commands:</strong> <code>cv2.CascadeClassifier()</code> loads a cascade file, and its <code>.detectMultiScale()</code> method scans a frame and returns a box for every face (or eye) it finds.</p>

        <h3>Stage 9: Face Recognition</h3>
        <p>Detection ("a face is here") is different from recognition ("whose face is this"), and recognition needs its own three-step pipeline: first, capture a batch of labeled face photos for each person; second, train a recognizer model on that labeled dataset; third, run the trained model live and have it predict who's in frame along with a confidence score, so a low-confidence match can be treated as "unknown" instead of a wrong guess.</p>
        <p><strong>Key commands:</strong> <code>cv2.face.LBPHFaceRecognizer_create()</code> builds the recognizer, <code>.train()</code> feeds it the labeled dataset, and <code>.predict()</code> returns a (person ID, confidence score) pair for a new face.</p>

        <h3>Stage 10: Feature Matching (ORB)</h3>
        <p>Beyond faces, general feature detection finds distinctive "keypoints" in any image - corners, blobs, unique textures - and describes each one in a way that can be matched against the same point seen from a different angle or lighting. This is the technique behind panorama-stitching and object tracking, and is worth knowing as the middle ground between simple pixel comparison and full deep-learning detection.</p>
        <p><strong>Key commands:</strong> <code>cv2.ORB_create()</code> sets up the detector, <code>.detectAndCompute()</code> finds keypoints and describes each one, and <code>cv2.drawKeypoints()</code> draws them onto a frame to visualize.</p>

        <h3>Capstone: Trained Object Detection (YOLO)</h3>
        <p>The most advanced stage moves away from hand-written rules entirely and fine-tunes a pre-trained deep-learning detector (YOLO) on a custom labeled dataset - a folder of images split into a training set and a validation set, each with the object locations marked. Training runs for a fixed number of passes ("epochs") over the dataset, and afterward the model can be pointed at a live webcam feed or new photos to detect and label objects it was never explicitly shown before.</p>
        <p>Before any training happens, every image needs its objects marked by hand - this is where <a href="https://roboflow.com/" target="_blank" rel="noopener">Roboflow</a> comes in. It's a browser-based annotation tool: upload the raw photos, then draw a bounding box around each object in every image and tag it with its class (Ambulance, Bus, Car, Motorcycle, Truck). Roboflow exports the finished set already split into training/validation folders with the label files in the exact format Ultralytics expects, which is what turns a folder of plain photos into a dataset a model can actually train on.</p>
        <p><strong>Key commands:</strong> this stage uses the separate <code>ultralytics</code> package rather than <code>cv2</code> directly - <code>YOLO()</code> loads a model checkpoint, <code>.train()</code> fine-tunes it on a labeled dataset, and <code>.predict()</code> runs detection on a new image, video, or webcam feed.</p>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>File paths:</strong> vision scripts constantly reference an image, video, or cascade file by path, and a path that works on one computer (or one folder) often breaks on another. Build the path relative to the script's own location instead of typing a fixed folder path, so moving the project - or handing it to someone else - doesn't silently fail on "file not found."</div></div>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>Model &amp; dataset files:</strong> trained models and datasets get large fast - a face-recognition model or a YOLO checkpoint can easily be tens of megabytes, and an image dataset can be hundreds of files. These generally don't belong committed straight into a normal code repository; keep them out of version control (or track them separately) and be aware that a trained model file only works with the exact library version it was trained on - a newer or older OpenCV/Ultralytics install can fail to load an old model file correctly.</div></div>

        <h3>Where to Go Next</h3>
        <p>From here, the natural directions are either going deeper into classic computer vision (motion tracking, lane detection, more advanced feature matching) or moving toward applied deep learning (training a custom classifier from scratch instead of fine-tuning, understanding what's actually happening inside a convolutional neural network rather than just fine-tuning one). Alongside project work, practicing algorithmic thinking on a site like <a href="https://leetcode.com/" target="_blank" rel="noopener">LeetCode</a> builds the general problem-solving skill that carries over into writing efficient image-processing code.</p>

        <h3>Beyond the Repo: Hand Tracking + Servo Control</h3>
        <p>Untracked, in-progress work in the same folder (never committed) prototyped MediaPipe hand-landmark tracking with fingertip color-matching driving an SG90 servo over <code>RPi.GPIO</code> PWM - the same idea later built out properly as its own project. See the <a href="report.html?id=raspi-vision">Raspberry Pi Vision &amp; GPIO Labs</a> report for the finished version.</p>
      `,
    },
    th: {
      eyebrow: "ม.5 · งานในชั้นเรียน",
      date: "เทอม 1",
      title: "Computer Vision ด้วย OpenCV - เส้นทางการเรียนรู้",
      meta: "แนวทางสอนแบบทีละขั้น จากการเปิดรูปภาพจนถึงการรู้จำใบหน้าและตรวจจับวัตถุด้วย YOLO",
      body: `
        <p>นี่คือแนวทางว่างานในวิชา OpenCV ค่อย ๆ ไต่ระดับขึ้นอย่างไรในทางปฏิบัติ ทีละขั้น อิงจากงานจริงในชั้นเรียน (<a href="https://github.com/eai-spsm/M.5-Classwork" target="_blank" rel="noopener">eai-spsm/M.5-Classwork</a> เขียนและรันใน VS Code) - เริ่มจากแค่เปิดรูปภาพ ไปจบที่ระบบรู้จำใบหน้าที่เทรนแล้วและตัวตรวจจับวัตถุที่ fine-tune แล้ว</p>

        <h3>ขั้นที่ 1: อ่านและแสดงผล</h3>
        <p>ทุกอย่างเริ่มจากโหลดภาพหรือเฟรมวิดีโอเข้าหน่วยความจำแล้วแสดงบนหน้าจอ - นี่คือ "hello world" ของทั้งวิชา หน้าต่างจะเด้งขึ้นมาแสดงภาพ หรือสำหรับวิดีโอ ลูปต่อเนื่องจะดึงเฟรมทีละเฟรมจากเว็บแคมหรือไฟล์แล้ววาดหน้าต่างใหม่จนกว่าจะกดปุ่มเพื่อออก การปรับขนาดภาพก่อนแสดงผลเป็นบทเรียนเชิงปฏิบัติแรก ๆ เพราะภาพความละเอียดเต็มมักใหญ่กว่าหน้าจอ</p>
        <p><strong>คำสั่งสำคัญ:</strong> <code>cv2.imread()</code> โหลดไฟล์ภาพ, <code>cv2.imshow()</code> แสดงในหน้าต่าง, <code>cv2.waitKey()</code> หยุดรอและฟังการกดปุ่ม, <code>cv2.VideoCapture()</code> เปิดเว็บแคมหรือไฟล์วิดีโอ, <code>.read()</code> ดึงเฟรมทีละเฟรม และ <code>.release()</code> คืนกล้อง/ไฟล์เมื่อใช้เสร็จ</p>

        <h3>ขั้นที่ 2: Mouse Events</h3>
        <p>ขั้นถัดไปคือทำให้หน้าต่างโต้ตอบได้: ผูก callback ที่ทำงานทุกครั้งที่เมาส์ขยับ คลิก หรือปล่อยปุ่มบนภาพ นี่คือสิ่งที่ทำให้โปรแกรมรู้ว่าผู้ใช้คลิกตรงไหนบนภาพ ซึ่งเป็นพื้นฐานของการคลิกเพื่อวาดรูปทรง คลิกลากเพื่อวาดสี่เหลี่ยม หรือเลือกพิกเซลเฉพาะเพื่อดูค่าสีของมัน แบบฝึกหัดที่ใช้เมาส์ทุกอันมีรูปแบบเดียวกัน - จำพิกัดตอนกดปุ่มลง วาด preview สดต่อเนื่องขณะเมาส์ขยับ แล้วสรุปรูปทรงตอนปล่อยปุ่ม</p>
        <p><strong>คำสั่งสำคัญ:</strong> <code>cv2.setMouseCallback()</code> ผูก handler สำหรับคลิก/ลากเข้ากับหน้าต่าง; ภายในนั้น รหัสเหตุการณ์อย่าง <code>cv2.EVENT_LBUTTONDOWN</code>, <code>cv2.EVENT_MOUSEMOVE</code> และ <code>cv2.EVENT_LBUTTONUP</code> บอกว่าเพิ่งเกิดอะไรขึ้น</p>

        <h3>ขั้นที่ 3: Crop, Flip, Rotate และ Resize</h3>
        <p>เมื่อมีพิกัดจากเมาส์หรือพื้นที่คงที่แล้ว การแปลงเชิงเรขาคณิตพื้นฐานก็ตามมาเอง: การ crop คือการ slice พื้นที่สี่เหลี่ยมออกจาก array ของภาพ การ flip คือการกลับด้านแนวนอนหรือแนวตั้ง และการ rotate คือการหมุนรอบจุดศูนย์กลางตามมุมที่กำหนด การ resize เปลี่ยนจำนวนพิกเซลที่แทนภาพและมีผลต่อประสิทธิภาพ - เฟรมที่เล็กกว่าประมวลผลแบบเรียลไทม์ได้เร็วกว่าเฟรมความละเอียดเต็มมาก</p>
        <p><strong>คำสั่งสำคัญ:</strong> การ crop คือการ slice array ธรรมดา (ไม่ต้องเรียก <code>cv2</code>), <code>cv2.flip()</code> กลับด้านภาพ, <code>cv2.resize()</code> ปรับขนาด และการหมุนมีสองขั้นตอน - <code>cv2.getRotationMatrix2D()</code> สร้าง rotation matrix แล้ว <code>cv2.warpAffine()</code> ใช้มันกับภาพ</p>

        <h3>ขั้นที่ 4: Color Spaces</h3>
        <p>ภาพไม่ได้เป็นแค่ "พิกเซลมีสี" - มันถูกเก็บเป็นสามช่องซ้อนกัน และลำดับก็สำคัญ OpenCV โหลดและเก็บภาพในลำดับ BGR (น้ำเงิน-เขียว-แดง) ไม่ใช่ลำดับ RGB ที่เครื่องมืออื่นส่วนใหญ่คาดหวัง การลืมเรื่องนี้คือบั๊กเรื่องสีที่พบบ่อยที่สุดในวิชานี้ ปรากฏเป็นภาพที่ดูออกโทนน้ำเงินหรือส้มโดยไม่มีสาเหตุชัดเจน นอกจาก BGR/RGB การแปลงเป็น HSV (hue, saturation, value) ทำให้แยกสีใดสีหนึ่งออกมาได้ง่ายขึ้นมากไม่ว่าแสงจะเป็นอย่างไร ซึ่งเป็นพื้นฐานที่การติดตามวัตถุด้วยสีมักสร้างขึ้นบน</p>
        <p><strong>คำสั่งสำคัญ:</strong> <code>cv2.cvtColor()</code> แปลงระหว่าง color space (BGR&rarr;Gray, BGR&rarr;HSV ฯลฯ) และ <code>cv2.split()</code>/<code>cv2.merge()</code> แยกช่องสีออกจากกันหรือรวมกลับ</p>

        <h3>ขั้นที่ 5: Thresholding และ Edge Detection</h3>
        <p>Thresholding แปลงภาพเกรย์สเกลให้เป็นขาวดำล้วนโดยเลือกค่าความสว่างตัดขาด - อะไรที่สูงกว่ากลายเป็นขาว ต่ำกว่ากลายเป็นดำ ค่าตัดขาดคงที่ใช้ได้ดีเมื่อแสงสม่ำเสมอ; adaptive thresholding คำนวณค่าตัดขาดแยกกันในแต่ละพื้นที่ของภาพ ซึ่งสำคัญเมื่อด้านหนึ่งของภาพสว่างกว่าอีกด้าน Edge detection (วิธีที่ใช้บ่อยที่สุดคือ Canny) ไปไกลกว่านั้นอีกขั้น: แทนที่จะแยกสว่างจากมืดอย่างเดียว มันลากเส้นขอบตรงจุดที่ความสว่างเปลี่ยนแปลงอย่างฉับพลัน ซึ่งเป็นพื้นฐานของการหารูปทรงแทนที่จะแค่แยกพื้นที่</p>
        <p><strong>คำสั่งสำคัญ:</strong> <code>cv2.threshold()</code> สำหรับค่าตัดขาดคงที่, <code>cv2.adaptiveThreshold()</code> สำหรับค่าตัดขาดแบบแยกพื้นที่, <code>cv2.GaussianBlur()</code> เพื่อลด noise ก่อนหา edge, <code>cv2.Canny()</code> สำหรับเส้นขอบ และ <code>cv2.Sobel()</code>/<code>cv2.Laplacian()</code> สำหรับตรวจจับ gradient ความสว่างแบบดิบ</p>

        <h3>ขั้นที่ 6: Contours</h3>
        <p>เมื่อตรวจจับ edge ได้แล้ว contours จะลากเส้นเหล่านั้นให้เป็นเส้นขอบต่อเนื่องที่โปรแกรมนำไปคิดต่อได้จริง - นับว่าในภาพมีรูปทรงแยกกันกี่รูป วัดพื้นที่ของรูปหนึ่ง หรือวาดกรอบล้อมรอบมัน นี่คือจุดแรกที่โปรแกรมขยับจาก "ประมวลผลพิกเซล" ไปเป็น "เข้าใจว่ามีวัตถุแยกกันอยู่ในภาพนี้"</p>
        <p><strong>คำสั่งสำคัญ:</strong> <code>cv2.findContours()</code> ลากเส้นขอบจากภาพ edge/threshold และ <code>cv2.drawContours()</code> วาดกลับลงบนเฟรมเพื่อตรวจสอบ</p>

        <h3>ขั้นที่ 7: Bitwise Operations และ Masking</h3>
        <p>Mask คือภาพขาวดำที่ใช้เป็นแม่แบบ - เมื่อรวมกับภาพต้นฉบับด้วย bitwise AND/OR/XOR มันสามารถแยกออกมาเฉพาะพื้นที่เดียว (เช่นใบหน้าที่ตรวจพบ) หรือลบพื้นที่นั้นออกทั้งหมด แนวคิดเดียวกันนี้ถูกใช้ต่อในการซ่อนหรือเน้นใบหน้าที่ตรวจพบ หรือแยกช่วงสีหนึ่งออกจากเฟรมที่เหลือ</p>
        <p><strong>คำสั่งสำคัญ:</strong> <code>cv2.bitwise_and()</code>, <code>cv2.bitwise_or()</code>, <code>cv2.bitwise_xor()</code> และ <code>cv2.bitwise_not()</code> รวมภาพกับ mask; <code>cv2.inRange()</code> สร้าง mask โดยตรงจากช่วงสี (เช่น ทุกอย่างที่อยู่ในช่วง HSV ที่กำหนด)</p>

        <h3>ขั้นที่ 8: Face Detection</h3>
        <p>Face detection ตอบคำถามว่า "มีใบหน้าอยู่ตรงนี้ไหม และตรงไหน" โดยใช้ Haar cascade - classifier ที่เทรนไว้ล่วงหน้า (มาพร้อม OpenCV ไม่ต้องเทรนเอง) ที่สแกนภาพในหลายสเกลเพื่อหาแพทเทิร์นความสว่าง/มืดที่เป็นลักษณะทั่วไปของใบหน้า มันเร็วเพราะปฏิเสธพื้นที่ที่ชัดเจนว่าไม่ใช่ใบหน้าได้ตั้งแต่ต้น แล้วใช้ความพยายามกับพื้นที่ที่มีแนวโน้มเท่านั้น ไฟล์ cascade ในตัวของ OpenCV สองไฟล์ครอบคลุมงานนี้: <code>haarcascade_frontalface_default.xml</code> สำหรับใบหน้า และ <code>haarcascade_eye_tree_eyeglasses.xml</code> สำหรับดวงตา - ทั้งสองมากับตัวไลบรารีเอง ไม่ต้องเทรนเพื่อใช้งาน เทคนิคเดียวกันใช้ได้กับดวงตาเช่นกัน และจับคู่กับ masking เพื่อเบลอหรือเน้นเฉพาะพื้นที่ที่ตรวจพบได้</p>
        <p><strong>คำสั่งสำคัญ:</strong> <code>cv2.CascadeClassifier()</code> โหลดไฟล์ cascade และเมธอด <code>.detectMultiScale()</code> ของมันสแกนเฟรมแล้วคืนกรอบสำหรับทุกใบหน้า (หรือดวงตา) ที่พบ</p>

        <h3>ขั้นที่ 9: Face Recognition</h3>
        <p>Detection ("มีใบหน้าอยู่ตรงนี้") ต่างจาก recognition ("ใบหน้านี้เป็นของใคร") และ recognition ต้องการ pipeline ของตัวเองสามขั้นตอน: ขั้นแรกเก็บชุดภาพใบหน้าที่ติด label ของแต่ละคน ขั้นที่สองเทรนโมเดล recognizer บน dataset ที่ติด label นั้น ขั้นที่สามรันโมเดลที่เทรนแล้วแบบเรียลไทม์ให้ทำนายว่าใครอยู่ในเฟรมพร้อมคะแนนความมั่นใจ เพื่อให้ผลที่มั่นใจต่ำถูกจัดเป็น "ไม่รู้จัก" แทนที่จะเป็นการเดาผิด</p>
        <p><strong>คำสั่งสำคัญ:</strong> <code>cv2.face.LBPHFaceRecognizer_create()</code> สร้าง recognizer, <code>.train()</code> ป้อน dataset ที่ติด label ให้มัน และ <code>.predict()</code> คืนค่า (person ID, คะแนนความมั่นใจ) สำหรับใบหน้าใหม่</p>

        <h3>ขั้นที่ 10: Feature Matching (ORB)</h3>
        <p>นอกเหนือจากใบหน้า การตรวจจับ feature ทั่วไปหา "keypoint" ที่โดดเด่นในภาพใด ๆ - มุม, blob, พื้นผิวเฉพาะตัว - แล้วอธิบายแต่ละจุดในแบบที่จับคู่กับจุดเดียวกันที่เห็นจากมุมหรือแสงต่างกันได้ นี่คือเทคนิคเบื้องหลังการต่อภาพพาโนรามาและการติดตามวัตถุ และควรรู้ไว้ในฐานะจุดกึ่งกลางระหว่างการเทียบพิกเซลแบบง่าย ๆ กับการตรวจจับด้วย deep learning เต็มรูปแบบ</p>
        <p><strong>คำสั่งสำคัญ:</strong> <code>cv2.ORB_create()</code> ตั้งค่า detector, <code>.detectAndCompute()</code> หา keypoint แล้วอธิบายแต่ละจุด และ <code>cv2.drawKeypoints()</code> วาดลงบนเฟรมเพื่อดูผล</p>

        <h3>โปรเจกต์ปิดคอร์ส: Trained Object Detection (YOLO)</h3>
        <p>ขั้นขั้นสูงสุดหันหลังให้กฎที่เขียนด้วยมือทั้งหมด แล้ว fine-tune ตัวตรวจจับ deep learning ที่เทรนไว้ล่วงหน้า (YOLO) บน dataset ที่ติด label เอง - โฟลเดอร์ภาพที่แบ่งเป็นชุดฝึกและชุดตรวจสอบ แต่ละภาพมีการทำเครื่องหมายตำแหน่งวัตถุไว้ การเทรนรันตามจำนวนรอบที่กำหนด ("epoch") บน dataset และหลังจากนั้นโมเดลสามารถชี้ไปที่ฟีดเว็บแคมสดหรือภาพใหม่เพื่อตรวจจับและติด label วัตถุที่ไม่เคยเห็นมาก่อนได้เลย</p>
        <p>ก่อนการเทรนจะเริ่มได้ ทุกภาพต้องถูกทำเครื่องหมายวัตถุด้วยมือก่อน - ตรงนี้เองที่ <a href="https://roboflow.com/" target="_blank" rel="noopener">Roboflow</a> เข้ามา มันเป็นเครื่องมือ annotation บนเบราว์เซอร์: อัปโหลดภาพดิบ แล้ววาดกรอบล้อมรอบแต่ละวัตถุในทุกภาพและติด tag ด้วยคลาสของมัน (Ambulance, Bus, Car, Motorcycle, Truck) Roboflow export ชุดข้อมูลที่เสร็จแล้วแบ่งเป็นโฟลเดอร์ training/validation พร้อมไฟล์ label ในฟอร์แมตที่ Ultralytics ต้องการพอดี ซึ่งเปลี่ยนโฟลเดอร์ภาพธรรมดาให้กลายเป็น dataset ที่โมเดลเทรนได้จริง</p>
        <p><strong>คำสั่งสำคัญ:</strong> ขั้นนี้ใช้แพ็กเกจ <code>ultralytics</code> แยกต่างหากแทนที่จะใช้ <code>cv2</code> โดยตรง - <code>YOLO()</code> โหลด model checkpoint, <code>.train()</code> fine-tune บน dataset ที่ติด label และ <code>.predict()</code> รันการตรวจจับบนภาพ วิดีโอ หรือฟีดเว็บแคมใหม่</p>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>File paths:</strong> สคริปต์ vision อ้างอิงไฟล์ภาพ วิดีโอ หรือ cascade ผ่าน path ตลอดเวลา และ path ที่ใช้ได้บนเครื่องหนึ่ง (หรือโฟลเดอร์หนึ่ง) มักพังบนอีกเครื่องหนึ่ง ให้สร้าง path แบบอิงกับตำแหน่งของสคริปต์เองแทนการพิมพ์ path ตายตัว เพื่อไม่ให้การย้ายโปรเจกต์ - หรือส่งต่อให้คนอื่น - พังแบบเงียบ ๆ ด้วย "file not found"</div></div>

        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>ไฟล์โมเดลและ dataset:</strong> โมเดลที่เทรนแล้วและ dataset มีขนาดใหญ่ขึ้นเร็วมาก - โมเดล face-recognition หรือ YOLO checkpoint ตัวหนึ่งอาจใหญ่หลายสิบเมกะไบต์ได้ง่าย ๆ และ image dataset อาจมีเป็นร้อยไฟล์ โดยทั่วไปสิ่งเหล่านี้ไม่ควร commit ลง code repository ปกติโดยตรง เก็บมันไว้นอกระบบ version control (หรือ track แยกต่างหาก) และจำไว้ว่าไฟล์โมเดลที่เทรนแล้วใช้ได้เฉพาะกับเวอร์ชันไลบรารีที่มันถูกเทรนมาเท่านั้น - การติดตั้ง OpenCV/Ultralytics ที่ใหม่หรือเก่ากว่าอาจโหลดไฟล์โมเดลเก่าไม่สำเร็จ</div></div>

        <h3>ก้าวต่อไป</h3>
        <p>จากจุดนี้ ทิศทางตามธรรมชาติคือลงลึกไปในทาง computer vision แบบดั้งเดิม (motion tracking, lane detection, feature matching ขั้นสูงกว่านี้) หรือมุ่งไปทาง applied deep learning (เทรน classifier เองตั้งแต่ศูนย์แทนที่จะ fine-tune, ทำความเข้าใจว่าเกิดอะไรขึ้นจริง ๆ ภายใน convolutional neural network แทนที่จะแค่ fine-tune มัน) นอกจากงานโปรเจกต์ การฝึกคิดเชิงอัลกอริทึมบนเว็บอย่าง <a href="https://leetcode.com/" target="_blank" rel="noopener">LeetCode</a> สร้างทักษะการแก้ปัญหาทั่วไปที่ส่งผลต่อการเขียนโค้ดประมวลผลภาพให้มีประสิทธิภาพด้วย</p>

        <h3>นอกเหนือจาก Repo: Hand Tracking + Servo Control</h3>
        <p>งานที่ยังไม่เสร็จและไม่ได้ track อยู่ในโฟลเดอร์เดียวกัน (ไม่เคย commit) ทดลอง prototype การตรวจจับตำแหน่งมือด้วย MediaPipe โดยจับคู่สีที่ปลายนิ้วขับเซอร์โว SG90 ผ่าน PWM ของ <code>RPi.GPIO</code> - แนวคิดเดียวกันที่ภายหลังถูกสร้างขึ้นอย่างจริงจังเป็นโปรเจกต์ของตัวเอง ดูรายงาน <a href="report.html?id=raspi-vision">Raspberry Pi Vision &amp; GPIO Labs</a> สำหรับเวอร์ชันที่เสร็จสมบูรณ์</p>
      `,
    },
  },

  "circuits-gpio": {
    icon: "bi-plug-fill",
    backAnchor: "m4",
    en: {
      eyebrow: "M.4 · Reports & Docs",
      date: "Semester 1",
      title: "Basic Circuits, Arduino & GPIO",
      meta: "Ohm's Law through series/parallel circuits, then board, breadboard, PWM, servo, ultrasonic & I2C on Arduino.",
      body: `
        <p>A guide to the electronics foundation before microcontroller work starts - the circuit theory needed to reason about a real breadboard, then Arduino's actual pins and the peripherals (LEDs, servos, sensors, an LCD) built on top of it.</p>

        <h3>Voltage, Current &amp; Resistance</h3>
        <p>A circuit needs three things to do useful work: a <strong>voltage</strong> (V, in volts) pushing charge around, a <strong>current</strong> (I, in amps) of charge actually flowing, and a <strong>resistance</strong> (R, in ohms) opposing that flow. Ohm's Law ties them together: <strong>V = IR</strong>. Power dissipated as heat follows from that: <strong>P = VI = I&sup2;R = V&sup2;/R</strong>.</p>
        <p><em>Worked example:</em> a 9V supply drives an LED (which drops 2V across itself) in series with a 330&Omega; resistor. Voltage across the resistor is 9 &minus; 2 = 7V, so current = 7/330 &asymp; 21.2mA, and power dissipated by the resistor = I&sup2;R &asymp; 0.148W.</p>

        <h3>Active-High vs. Active-Low Logic</h3>
        <p>Every microcontroller pin only understands two states: HIGH (near supply voltage) and LOW (near 0V). Whether a device "activates" on HIGH or LOW is a design choice, and mixing the two up is one of the most common wiring mistakes. Active-high is the intuitive case - most LEDs and simple sensor outputs turn on when the pin goes HIGH. Active-low looks backwards at first (a button "press" reading as LOW), but it's actually more reliable, for the reason the next section covers.</p>

        <div class="report-diagram">
          <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" font-size="9.5" fill="none" stroke="currentColor" stroke-width="1.3">
            <!-- A: Active-High -->
            <text x="70" y="14" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">A - Active-High</text>
            <text x="70" y="26" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.6">pin &rarr; resistor &rarr; load &rarr; GND</text>
            <line x1="70" y1="34" x2="70" y2="44" stroke-opacity="0.8"/>
            <text x="70" y="32" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">pin</text>
            <path d="M 70 44 V 49 L 76 52 L 64 56 L 76 60 L 64 64 L 70 68 V 73" stroke-opacity="0.8"/>
            <text x="84" y="60" stroke="none" fill="currentColor" opacity="0.75">R</text>
            <line x1="70" y1="73" x2="70" y2="85" stroke-opacity="0.8"/>
            <polygon points="63,85 63,97 77,91" stroke-opacity="0.8"/>
            <line x1="77" y1="85" x2="77" y2="97" stroke-width="1.8"/>
            <line x1="77" y1="91" x2="70" y2="120" stroke-opacity="0.8"/>
            <text x="70" y="133" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">GND</text>
            <text x="70" y="145" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.55">load ON when pin = HIGH</text>

            <line x1="160" y1="10" x2="160" y2="140" stroke-opacity="0.25" stroke-dasharray="2 3"/>

            <!-- B: Active-Low -->
            <text x="250" y="14" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">B - Active-Low</text>
            <text x="250" y="26" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.6">5V &rarr; resistor &rarr; load &rarr; pin</text>
            <line x1="250" y1="34" x2="250" y2="44" stroke-opacity="0.8"/>
            <text x="250" y="32" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">5V</text>
            <path d="M 250 44 V 49 L 256 52 L 244 56 L 256 60 L 244 64 L 250 68 V 73" stroke-opacity="0.8"/>
            <text x="264" y="60" stroke="none" fill="currentColor" opacity="0.75">R</text>
            <line x1="250" y1="73" x2="250" y2="85" stroke-opacity="0.8"/>
            <polygon points="243,85 243,97 257,91" stroke-opacity="0.8"/>
            <line x1="257" y1="85" x2="257" y2="97" stroke-width="1.8"/>
            <line x1="257" y1="91" x2="250" y2="120" stroke-opacity="0.8"/>
            <text x="250" y="133" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">pin</text>
            <text x="250" y="145" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.55">load ON when pin = LOW</text>
          </svg>
          <figcaption>A (active-high): the pin sources current itself, so the load lights when the pin drives HIGH. B (active-low): the load sits between a fixed 5V and the pin, so it only lights when the pin drives LOW and gives the current somewhere to go.</figcaption>
        </div>

        <h3>Pull-Up &amp; Pull-Down Resistors</h3>
        <p>An input pin with absolutely nothing connected to it doesn't read a clean 0 - it "floats," picking up random electrical noise from the air and nearby wires, so <code>digitalRead()</code> can flicker between HIGH and LOW with nothing touching it. A button by itself has exactly this problem: when it's not pressed, its pin isn't connected to anything definite. The fix is a resistor that gives the pin a default state to fall back to whenever the button isn't actively pulling it somewhere else.</p>

        <div class="report-diagram">
          <svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg" font-size="9.5" fill="none" stroke="currentColor" stroke-width="1.3">
            <!-- Pull-up (left) -->
            <text x="70" y="14" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">A - Pull-up</text>
            <line x1="70" y1="22" x2="70" y2="34" stroke-opacity="0.8"/>
            <text x="70" y="20" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">5V</text>
            <path d="M 70 34 V 39 L 76 42 L 64 46 L 76 50 L 64 54 L 70 58 V 64" stroke-opacity="0.8"/>
            <text x="84" y="50" stroke="none" fill="currentColor" opacity="0.75">10k&#937;</text>
            <line x1="70" y1="64" x2="70" y2="90" stroke-opacity="0.8"/>
            <circle cx="70" cy="90" r="2.4" fill="currentColor" stroke="none"/>
            <line x1="70" y1="90" x2="118" y2="90" stroke-opacity="0.8"/>
            <text x="122" y="93" stroke="none" fill="currentColor" font-weight="700">pin</text>
            <line x1="70" y1="90" x2="70" y2="120" stroke-dasharray="3 3" stroke-opacity="0.55"/>
            <circle cx="70" cy="132" r="9" stroke-opacity="0.8"/>
            <text x="70" y="135" text-anchor="middle" font-size="10" stroke="none" fill="currentColor">&#9099;</text>
            <line x1="70" y1="141" x2="70" y2="156" stroke-opacity="0.8"/>
            <text x="70" y="167" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">GND (pressed)</text>
            <text x="70" y="105" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.55">idle = HIGH</text>

            <!-- divider -->
            <line x1="160" y1="10" x2="160" y2="160" stroke-opacity="0.25" stroke-dasharray="2 3"/>

            <!-- Pull-down (right) -->
            <text x="250" y="14" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">B - Pull-down</text>
            <line x1="250" y1="22" x2="250" y2="34" stroke-opacity="0.8"/>
            <text x="250" y="20" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">5V</text>
            <circle cx="250" cy="46" r="9" stroke-opacity="0.8"/>
            <text x="250" y="49" text-anchor="middle" font-size="10" stroke="none" fill="currentColor">&#9099;</text>
            <line x1="250" y1="55" x2="250" y2="90" stroke-opacity="0.8"/>
            <circle cx="250" cy="90" r="2.4" fill="currentColor" stroke="none"/>
            <line x1="250" y1="90" x2="298" y2="90" stroke-opacity="0.8"/>
            <text x="302" y="93" stroke="none" fill="currentColor" font-weight="700">pin</text>
            <text x="250" y="105" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.55">idle = LOW</text>
            <line x1="250" y1="90" x2="250" y2="116" stroke-dasharray="3 3" stroke-opacity="0.55"/>
            <path d="M 250 116 V 121 L 256 124 L 244 128 L 256 132 L 244 136 L 250 140 V 146" stroke-opacity="0.8"/>
            <text x="264" y="132" stroke="none" fill="currentColor" opacity="0.75">10k&#937;</text>
            <line x1="250" y1="146" x2="250" y2="156" stroke-opacity="0.8"/>
            <text x="250" y="167" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">GND</text>
          </svg>
          <figcaption>A (pull-up): 5V &rarr; resistor &rarr; pin &rarr; switch &rarr; GND - pin rests HIGH, switch pulls it LOW when pressed. B (pull-down): 5V &rarr; switch &rarr; pin &rarr; resistor &rarr; GND - pin rests LOW, switch pulls it HIGH when pressed. Either way, the pin always has a defined state - never floating.</figcaption>
        </div>

        <p>Arduino's <code>INPUT_PULLUP</code> mode enables a small internal pull-up resistor (no external resistor needed) between the pin and 5V, which is why a button wired that way reads HIGH when idle and LOW when pressed - active-low, exactly as in the section above. There's no equivalent built-in pull-down on standard Arduino boards, so a pull-down circuit needs its own external resistor if that's the behavior a project actually wants.</p>

        <h3>Series, Parallel &amp; Mixed Circuits</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Type</th><th>Current</th><th>Voltage</th><th>Equivalent resistance</th></tr></thead>
          <tbody>
            <tr><td>Series</td><td>Same everywhere (one loop, one path)</td><td>Splits across each component</td><td>R<sub>eq</sub> = R1 + R2 + &hellip;</td></tr>
            <tr><td>Parallel</td><td>Splits between branches</td><td>Same across every branch</td><td>1/R<sub>eq</sub> = 1/R1 + 1/R2 + &hellip;</td></tr>
          </tbody>
        </table></div>
        <p>Real circuits are usually a mix of both - the trick is simplifying from the inside out: collapse any parallel group into one equivalent resistor first, then add what remains in series (or vice versa), one step at a time, and sanity-check that the currents into a parallel block always add up to what flows into it.</p>

        <h3>Measuring a Circuit</h3>
        <p>How you connect a meter changes what it actually measures. A <strong>voltmeter</strong> goes in <strong>parallel</strong> across the two points being compared, and needs very high internal resistance so it barely disturbs the circuit. An <strong>ammeter</strong> goes in <strong>series</strong> - the wire has to be physically broken and the meter inserted into the path - and needs very low internal resistance so it doesn't add extra resistance to the loop.</p>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>Common mistake:</strong> wiring an ammeter in parallel across a component instead of in series. Because an ammeter has near-zero resistance, this creates a short circuit - it can blow the meter's internal fuse or damage the circuit. Always break the wire and insert the ammeter in series, never across.</div></div>

        <h3>The Arduino Board</h3>
        <p>A microcontroller is a tiny computer on a single chip - processor, memory, and I/O pins, but no operating system. The Arduino Uno wraps one in an easy-to-use board: plug into USB, write code in the Arduino IDE, upload directly.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Pin group</th><th>Label</th><th>What it does</th></tr></thead>
          <tbody>
            <tr><td>Digital I/O</td><td>D0-D13</td><td>General-purpose pins - read or write HIGH/LOW. D0/D1 double as Serial (USB), best avoided when other components are attached</td></tr>
            <tr><td>PWM-capable</td><td>~3, ~5, ~6, ~9, ~10, ~11</td><td>Digital pins marked with a ~ can output a simulated analog signal - LED brightness, motor speed, servo control</td></tr>
            <tr><td>Analog input</td><td>A0-A5</td><td>Reads a continuous 0-5V voltage as a number from 0-1023 - potentiometers, light sensors, etc.</td></tr>
            <tr><td>Power</td><td>5V, 3.3V, GND, VIN</td><td>GND must be shared with every external circuit - without a common 0V reference, signals become meaningless</td></tr>
          </tbody>
        </table></div>

        <h3>Breadboard Basics</h3>
        <p>A breadboard wires components together without soldering - the whole trick is knowing which holes are electrically connected. Each short vertical column of 5 holes in the main grid is connected together and isolated from every other column; plugging two components into the same column wires them together. The power rails along the top and bottom edges run the full length of the board instead - every hole on the same rail is the same node, which is what makes them the natural place to run shared 5V and GND.</p>

        <h3>Arduino IDE &amp; the Sketch Structure</h3>
        <p>Setup: install the Arduino IDE, connect the board over USB, select the right board under Tools &rarr; Board and the right COM port under Tools &rarr; Port, then write or open a <code>.ino</code> sketch and click Upload. Every sketch needs exactly two functions - <code>setup()</code> runs once at power-on (pin modes, starting Serial, initializing libraries), and <code>loop()</code> runs forever after that, for as long as the board has power.</p>

        <h3>First Task: Blinking an LED</h3>
        <p>An LED is polarized - current only flows through the longer leg (anode) to the shorter leg (cathode). Wired D9 &rarr; resistor &rarr; LED anode &rarr; LED cathode &rarr; GND:</p>

        <div class="report-diagram">
          <svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg" font-size="8.5" fill="none" stroke="currentColor">
            <defs><marker id="led-arr" markerWidth="5" markerHeight="5" refX="4" refY="2" orient="auto"><polygon points="0,0 5,2 0,4" fill="currentColor" stroke="none"/></marker></defs>
            <rect x="10" y="40" width="55" height="43" rx="5" fill="currentColor" fill-opacity="0.12" stroke-width="1.3"/>
            <text x="37.5" y="59" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">Arduino</text>
            <text x="37.5" y="71" text-anchor="middle" opacity="0.6" font-size="7" stroke="none" fill="currentColor">Uno</text>
            <line x1="65" y1="50" x2="80" y2="50" stroke-width="1.3" stroke-opacity="0.8"/>
            <line x1="65" y1="75" x2="80" y2="75" stroke-width="1.3" stroke-opacity="0.8"/>
            <path d="M 80 50 H 150 V 60" stroke-width="1.3" stroke-opacity="0.8"/>
            <text x="115" y="44" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">D9</text>
            <path d="M 150 60 V 65 L 156 68 L 144 72 L 156 76 L 144 80 L 150 84 V 90" stroke-width="1.3" stroke-opacity="0.8"/>
            <text x="163" y="76" font-weight="700" stroke="none" fill="currentColor">220&#937;</text>
            <path d="M 150 90 V 102 H 190" stroke-width="1.3" stroke-opacity="0.8"/>
            <polygon points="190,96 190,108 204,102" stroke-width="1.3" stroke-opacity="0.8"/>
            <line x1="204" y1="96" x2="204" y2="108" stroke-width="1.8"/>
            <line x1="196" y1="93" x2="200" y2="86" stroke-width="1" marker-end="url(#led-arr)"/>
            <line x1="201" y1="93" x2="205" y2="86" stroke-width="1" marker-end="url(#led-arr)"/>
            <text x="197" y="122" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">LED</text>
            <path d="M 204 102 H 245 V 75 H 80" stroke-width="1.3" stroke-opacity="0.8"/>
            <text x="115" y="90" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">GND</text>
          </svg>
          <figcaption>D9 &rarr; 220&#937; resistor &rarr; LED (anode toward the resistor, cathode toward GND) &rarr; GND - the resistor limits current so the LED gets to light up instead of burning out.</figcaption>
        </div>

        <p>Skipping the resistor is the single fastest way to destroy an LED. A resistor obeys Ohm's Law in a straight line - double the voltage, double the current - but an LED doesn't behave like that at all: below its forward voltage (roughly 1.8-3.3V depending on color) it conducts almost nothing, and just past that threshold its current shoots up extremely steeply for only a tiny further increase in voltage. Wired directly across 5V with nothing to limit it, an LED tries to pull however much current the pin can physically supply - way past its actual rating (most small LEDs are rated around 20mA) - and it burns out in a fraction of a second, sometimes instantly. The series resistor is what holds that current down to a safe level: the same 220&Omega; from the worked example earlier, dropping the leftover voltage the LED isn't using and turning it into a small, harmless amount of heat instead of letting the LED try to eat it all as current.</p>

        <pre class="code-block"><code>const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // on
  delay(1000);
  digitalWrite(LED_PIN, LOW);   // off
  delay(1000);
}</code></pre>

        <h3>Digital Input: a Button</h3>
        <p>Wired with <code>INPUT_PULLUP</code>, a button reads HIGH when idle and LOW when pressed (active-low, from above):</p>
        <pre class="code-block"><code>pinMode(BUTTON_PIN, INPUT_PULLUP);
pinMode(LED_PIN, OUTPUT);
// in loop():
bool pressed = (digitalRead(BUTTON_PIN) == LOW);
digitalWrite(LED_PIN, pressed ? HIGH : LOW);</code></pre>

        <h3>PWM: Faking an Analog Voltage</h3>
        <p>A digital pin is only ever fully HIGH or fully LOW - there's no "half voltage." PWM fakes an in-between level by switching the pin on and off very fast: the more of each cycle it spends HIGH (the duty cycle), the higher the effective voltage looks to an LED, motor, or servo. Only pins marked ~ support it, via <code>analogWrite(pin, value)</code> where value ranges 0 (always off) to 255 (always on).</p>

        <h3>Servo Motor</h3>
        <p>A servo holds a precise angle (0&deg;-180&deg;) rather than spinning continuously - three wires: power (red, 5V), ground (brown/black), and signal (orange/yellow, a PWM pin). A servo under load can briefly spike enough current to brown out the board's onboard 5V regulator and cause random resets - for more than one servo, or a larger one, power them from a separate 5V supply sharing GND with the board instead.</p>
        <pre class="code-block"><code>#include &lt;Servo.h&gt;
Servo myServo;

void setup() {
  myServo.attach(9);  // signal wire
}
void loop() {
  myServo.write(90);  // move to 90 degrees
}</code></pre>

        <h3>Ultrasonic Distance Sensor (HC-SR04)</h3>
        <p>Sends a pulse from TRIG, times how long ECHO takes to see it bounce back, and converts that round-trip time to distance using the speed of sound (&asymp;0.0343 cm/&micro;s), dividing by 2 since the pulse travels there and back: <strong>d = (t &times; 0.0343) / 2</strong>.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Sensor pin</th><th>Connect to</th></tr></thead>
          <tbody>
            <tr><td>TRIG</td><td>Any digital pin, set OUTPUT</td></tr>
            <tr><td>ECHO</td><td>Any digital pin, set INPUT</td></tr>
          </tbody>
        </table></div>

        <h3>I2C: Running an LCD on 4 Wires</h3>
        <p>I2C is a 2-wire protocol - instead of one pin per signal, many devices share just <strong>SDA</strong> (data) and <strong>SCL</strong> (clock). A 16x2 character LCD needs only 4 wires total (power, ground, SDA, SCL) despite having far more internal logic than a single LED, and multiple I2C devices can share the same two bus wires as long as no two share the same address.</p>

        <h3>Where to Go Next</h3>
        <p>Combining several of these pieces into one project (a button that changes a servo's position, a sensor reading pushed to the LCD, PWM-controlled brightness reacting to a distance sensor) is the natural next step before moving into the more advanced kinematics-driven robotics work - see the <a href="report.html?id=physics-robotics">Physics in Robotics</a> report for where this leads.</p>
      `,
    },
    th: {
      eyebrow: "ม.4 · งานในชั้นเรียน",
      date: "เทอม 1",
      title: "วงจรพื้นฐาน, Arduino และ GPIO",
      meta: "กฎของโอห์มสู่วงจรอนุกรม/ขนาน จากนั้นบอร์ด เบรดบอร์ด PWM เซอร์โว อัลตราโซนิก และ I2C บน Arduino",
      body: `
        <p>แนวทางพื้นฐานอิเล็กทรอนิกส์ก่อนเริ่มงานไมโครคอนโทรลเลอร์ - ทฤษฎีวงจรที่ต้องใช้คิดกับเบรดบอร์ดจริง จากนั้นเป็นขาต่าง ๆ ของ Arduino และอุปกรณ์ต่อพ่วง (LED, เซอร์โว, เซนเซอร์, LCD) ที่สร้างต่อยอดจากมัน</p>

        <h3>แรงดันไฟ กระแสไฟ และความต้านทาน</h3>
        <p>วงจรต้องมีสามอย่างถึงจะทำงานได้: <strong>แรงดันไฟ</strong> (V, หน่วยโวลต์) ที่ดันประจุให้เคลื่อนที่, <strong>กระแสไฟ</strong> (I, หน่วยแอมป์) ของประจุที่ไหลจริง และ <strong>ความต้านทาน</strong> (R, หน่วยโอห์ม) ที่ต้านการไหลนั้น กฎของโอห์มผูกทั้งสามไว้ด้วยกัน: <strong>V = IR</strong> กำลังไฟที่สลายเป็นความร้อนตามมาจากตรงนั้น: <strong>P = VI = I&sup2;R = V&sup2;/R</strong></p>
        <p><em>ตัวอย่างการคำนวณ:</em> แหล่งจ่าย 9V ขับ LED (ซึ่งกินแรงดันตกคร่อม 2V) ต่ออนุกรมกับตัวต้านทาน 330&Omega; แรงดันตกคร่อมตัวต้านทาน = 9 &minus; 2 = 7V ดังนั้นกระแส = 7/330 &asymp; 21.2mA และกำลังไฟที่ตัวต้านทานสลาย = I&sup2;R &asymp; 0.148W</p>

        <h3>Logic แบบ Active-High กับ Active-Low</h3>
        <p>ขาของไมโครคอนโทรลเลอร์เข้าใจแค่สองสถานะ: HIGH (ใกล้แรงดันไฟเลี้ยง) และ LOW (ใกล้ 0V) อุปกรณ์จะ "ทำงาน" ตอน HIGH หรือ LOW เป็นทางเลือกในการออกแบบ และการสลับสองแบบนี้สับสนกันคือข้อผิดพลาดในการต่อสายที่พบบ่อยที่สุดอย่างหนึ่ง Active-high เป็นกรณีที่เข้าใจง่าย - LED และเซนเซอร์ output ธรรมดาส่วนใหญ่ติดตอนขาเป็น HIGH Active-low ดูเหมือนกลับด้านตอนแรก (ปุ่ม "กด" อ่านได้เป็น LOW) แต่จริง ๆ แล้วเชื่อถือได้มากกว่า ด้วยเหตุผลที่หัวข้อถัดไปจะอธิบาย</p>

        <div class="report-diagram">
          <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" font-size="9.5" fill="none" stroke="currentColor" stroke-width="1.3">
            <!-- A: Active-High -->
            <text x="70" y="14" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">A - Active-High</text>
            <text x="70" y="26" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.6">pin &rarr; ตัวต้านทาน &rarr; โหลด &rarr; GND</text>
            <line x1="70" y1="34" x2="70" y2="44" stroke-opacity="0.8"/>
            <text x="70" y="32" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">pin</text>
            <path d="M 70 44 V 49 L 76 52 L 64 56 L 76 60 L 64 64 L 70 68 V 73" stroke-opacity="0.8"/>
            <text x="84" y="60" stroke="none" fill="currentColor" opacity="0.75">R</text>
            <line x1="70" y1="73" x2="70" y2="85" stroke-opacity="0.8"/>
            <polygon points="63,85 63,97 77,91" stroke-opacity="0.8"/>
            <line x1="77" y1="85" x2="77" y2="97" stroke-width="1.8"/>
            <line x1="77" y1="91" x2="70" y2="120" stroke-opacity="0.8"/>
            <text x="70" y="133" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">GND</text>
            <text x="70" y="145" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.55">โหลดติดเมื่อ pin = HIGH</text>

            <line x1="160" y1="10" x2="160" y2="140" stroke-opacity="0.25" stroke-dasharray="2 3"/>

            <!-- B: Active-Low -->
            <text x="250" y="14" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">B - Active-Low</text>
            <text x="250" y="26" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.6">5V &rarr; ตัวต้านทาน &rarr; โหลด &rarr; pin</text>
            <line x1="250" y1="34" x2="250" y2="44" stroke-opacity="0.8"/>
            <text x="250" y="32" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">5V</text>
            <path d="M 250 44 V 49 L 256 52 L 244 56 L 256 60 L 244 64 L 250 68 V 73" stroke-opacity="0.8"/>
            <text x="264" y="60" stroke="none" fill="currentColor" opacity="0.75">R</text>
            <line x1="250" y1="73" x2="250" y2="85" stroke-opacity="0.8"/>
            <polygon points="243,85 243,97 257,91" stroke-opacity="0.8"/>
            <line x1="257" y1="85" x2="257" y2="97" stroke-width="1.8"/>
            <line x1="257" y1="91" x2="250" y2="120" stroke-opacity="0.8"/>
            <text x="250" y="133" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">pin</text>
            <text x="250" y="145" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.55">โหลดติดเมื่อ pin = LOW</text>
          </svg>
          <figcaption>A (active-high): ขา pin จ่ายกระแสเอง ดังนั้นโหลดจะติดเมื่อ pin ขับ HIGH B (active-low): โหลดอยู่ระหว่าง 5V คงที่กับ pin ดังนั้นจะติดเฉพาะตอน pin ขับ LOW และให้ทางกระแสไหลไปที่ไหนสักแห่ง</figcaption>
        </div>

        <h3>ตัวต้านทาน Pull-Up และ Pull-Down</h3>
        <p>ขา input ที่ไม่ได้ต่ออะไรเลยจะไม่อ่านค่า 0 ที่ชัดเจน - มันจะ "ลอย" รับสัญญาณรบกวนไฟฟ้าแบบสุ่มจากอากาศและสายไฟใกล้เคียง ดังนั้น <code>digitalRead()</code> อาจกระพริบสลับ HIGH กับ LOW ได้โดยไม่มีอะไรแตะเลย ปุ่มกดเดี่ยว ๆ มีปัญหานี้พอดี: ตอนไม่ได้กด ขาของมันไม่ได้ต่อกับอะไรที่แน่นอน วิธีแก้คือตัวต้านทานที่ให้ค่าเริ่มต้นแก่ขานั้นให้กลับไปพักไว้เมื่อปุ่มไม่ได้ดึงมันไปที่อื่น</p>

        <div class="report-diagram">
          <svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg" font-size="9.5" fill="none" stroke="currentColor" stroke-width="1.3">
            <!-- Pull-up (left) -->
            <text x="70" y="14" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">A - Pull-up</text>
            <line x1="70" y1="22" x2="70" y2="34" stroke-opacity="0.8"/>
            <text x="70" y="20" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">5V</text>
            <path d="M 70 34 V 39 L 76 42 L 64 46 L 76 50 L 64 54 L 70 58 V 64" stroke-opacity="0.8"/>
            <text x="84" y="50" stroke="none" fill="currentColor" opacity="0.75">10k&#937;</text>
            <line x1="70" y1="64" x2="70" y2="90" stroke-opacity="0.8"/>
            <circle cx="70" cy="90" r="2.4" fill="currentColor" stroke="none"/>
            <line x1="70" y1="90" x2="118" y2="90" stroke-opacity="0.8"/>
            <text x="122" y="93" stroke="none" fill="currentColor" font-weight="700">pin</text>
            <line x1="70" y1="90" x2="70" y2="120" stroke-dasharray="3 3" stroke-opacity="0.55"/>
            <circle cx="70" cy="132" r="9" stroke-opacity="0.8"/>
            <text x="70" y="135" text-anchor="middle" font-size="10" stroke="none" fill="currentColor">&#9099;</text>
            <line x1="70" y1="141" x2="70" y2="156" stroke-opacity="0.8"/>
            <text x="70" y="167" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">GND (เมื่อกด)</text>
            <text x="70" y="105" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.55">ปกติ = HIGH</text>

            <!-- divider -->
            <line x1="160" y1="10" x2="160" y2="160" stroke-opacity="0.25" stroke-dasharray="2 3"/>

            <!-- Pull-down (right) -->
            <text x="250" y="14" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">B - Pull-down</text>
            <line x1="250" y1="22" x2="250" y2="34" stroke-opacity="0.8"/>
            <text x="250" y="20" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">5V</text>
            <circle cx="250" cy="46" r="9" stroke-opacity="0.8"/>
            <text x="250" y="49" text-anchor="middle" font-size="10" stroke="none" fill="currentColor">&#9099;</text>
            <line x1="250" y1="55" x2="250" y2="90" stroke-opacity="0.8"/>
            <circle cx="250" cy="90" r="2.4" fill="currentColor" stroke="none"/>
            <line x1="250" y1="90" x2="298" y2="90" stroke-opacity="0.8"/>
            <text x="302" y="93" stroke="none" fill="currentColor" font-weight="700">pin</text>
            <text x="250" y="105" text-anchor="middle" font-size="7.5" stroke="none" fill="currentColor" opacity="0.55">ปกติ = LOW</text>
            <line x1="250" y1="90" x2="250" y2="116" stroke-dasharray="3 3" stroke-opacity="0.55"/>
            <path d="M 250 116 V 121 L 256 124 L 244 128 L 256 132 L 244 136 L 250 140 V 146" stroke-opacity="0.8"/>
            <text x="264" y="132" stroke="none" fill="currentColor" opacity="0.75">10k&#937;</text>
            <line x1="250" y1="146" x2="250" y2="156" stroke-opacity="0.8"/>
            <text x="250" y="167" text-anchor="middle" font-size="8" stroke="none" fill="currentColor" opacity="0.6">GND</text>
          </svg>
          <figcaption>A (pull-up): 5V &rarr; ตัวต้านทาน &rarr; pin &rarr; สวิตช์ &rarr; GND - pin พักที่ HIGH สวิตช์ดึงลงเป็น LOW ตอนกด B (pull-down): 5V &rarr; สวิตช์ &rarr; pin &rarr; ตัวต้านทาน &rarr; GND - pin พักที่ LOW สวิตช์ดึงขึ้นเป็น HIGH ตอนกด ไม่ว่าแบบไหน pin จะมีสถานะที่แน่นอนเสมอ - ไม่มีลอย</figcaption>
        </div>

        <p>โหมด <code>INPUT_PULLUP</code> ของ Arduino เปิดใช้ตัวต้านทาน pull-up เล็ก ๆ ในตัว (ไม่ต้องมีตัวต้านทานภายนอก) ระหว่างขากับ 5V ซึ่งเป็นเหตุผลที่ปุ่มต่อแบบนี้อ่านค่าเป็น HIGH ตอนไม่กดและ LOW ตอนกด - active-low ตรงตามหัวข้อด้านบน บอร์ด Arduino มาตรฐานไม่มี pull-down ในตัวให้ใช้ ดังนั้นวงจร pull-down ต้องมีตัวต้านทานภายนอกของตัวเองถ้าโปรเจกต์ต้องการพฤติกรรมแบบนั้นจริง ๆ</p>

        <h3>วงจรอนุกรม ขนาน และแบบผสม</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ประเภท</th><th>กระแส</th><th>แรงดัน</th><th>ความต้านทานสมมูล</th></tr></thead>
          <tbody>
            <tr><td>อนุกรม</td><td>เท่ากันทุกจุด (วงเดียว เส้นทางเดียว)</td><td>แบ่งกันคร่อมแต่ละอุปกรณ์</td><td>R<sub>eq</sub> = R1 + R2 + &hellip;</td></tr>
            <tr><td>ขนาน</td><td>แบ่งระหว่างแต่ละสาขา</td><td>เท่ากันทุกสาขา</td><td>1/R<sub>eq</sub> = 1/R1 + 1/R2 + &hellip;</td></tr>
          </tbody>
        </table></div>
        <p>วงจรจริงมักผสมทั้งสองแบบ - เคล็ดลับคือลดรูปจากด้านในออกมา: รวมกลุ่มขนานให้เป็นตัวต้านทานสมมูลเดียวก่อน แล้วบวกส่วนที่เหลือแบบอนุกรม (หรือสลับกัน) ทีละขั้น และตรวจสอบว่ากระแสที่ไหลเข้าบล็อกขนานรวมกันได้เท่ากับที่ไหลเข้ามาจริง</p>

        <h3>การวัดวงจร</h3>
        <p>วิธีต่อมิเตอร์เปลี่ยนสิ่งที่มันวัดได้จริง <strong>โวลต์มิเตอร์</strong> ต่อแบบ <strong>ขนาน</strong> คร่อมสองจุดที่จะเทียบ และต้องมีความต้านทานภายในสูงมากเพื่อไม่ให้รบกวนวงจร <strong>แอมมิเตอร์</strong> ต่อแบบ <strong>อนุกรม</strong> - ต้องตัดสายจริงแล้วแทรกมิเตอร์เข้าไปในเส้นทาง - และต้องมีความต้านทานภายในต่ำมากเพื่อไม่ให้เพิ่มความต้านทานให้วงจร</p>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>ข้อผิดพลาดที่พบบ่อย:</strong> ต่อแอมมิเตอร์แบบขนานคร่อมอุปกรณ์แทนที่จะต่ออนุกรม เพราะแอมมิเตอร์มีความต้านทานเกือบเป็นศูนย์ วิธีนี้จะสร้างวงจรลัด - อาจทำให้ฟิวส์ภายในมิเตอร์ขาดหรือทำให้วงจรเสียหาย ต้องตัดสายและแทรกแอมมิเตอร์แบบอนุกรมเสมอ ห้ามต่อคร่อม</div></div>

        <h3>บอร์ด Arduino</h3>
        <p>ไมโครคอนโทรลเลอร์คือคอมพิวเตอร์เล็ก ๆ บนชิปตัวเดียว - มีตัวประมวลผล หน่วยความจำ และขา I/O แต่ไม่มีระบบปฏิบัติการ Arduino Uno ห่อไมโครคอนโทรลเลอร์ไว้ในบอร์ดที่ใช้งานง่าย: เสียบ USB เขียนโค้ดใน Arduino IDE อัปโหลดได้เลย</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>กลุ่มขา</th><th>ป้ายกำกับ</th><th>หน้าที่</th></tr></thead>
          <tbody>
            <tr><td>Digital I/O</td><td>D0-D13</td><td>ขาอเนกประสงค์ - อ่านหรือเขียน HIGH/LOW D0/D1 ทำหน้าที่ Serial (USB) ควบคู่ด้วย ควรเลี่ยงใช้เมื่อมีอุปกรณ์อื่นต่ออยู่</td></tr>
            <tr><td>รองรับ PWM</td><td>~3, ~5, ~6, ~9, ~10, ~11</td><td>ขา digital ที่มีเครื่องหมาย ~ สามารถส่งสัญญาณอนาล็อกจำลองได้ - ความสว่าง LED, ความเร็วมอเตอร์, ควบคุมเซอร์โว</td></tr>
            <tr><td>Analog input</td><td>A0-A5</td><td>อ่านแรงดันต่อเนื่อง 0-5V เป็นตัวเลข 0-1023 - โพเทนชิโอมิเตอร์, เซนเซอร์แสง ฯลฯ</td></tr>
            <tr><td>ไฟเลี้ยง</td><td>5V, 3.3V, GND, VIN</td><td>GND ต้องต่อร่วมกับทุกวงจรภายนอกเสมอ - ถ้าไม่มีจุดอ้างอิง 0V ร่วมกัน สัญญาณจะไม่มีความหมาย</td></tr>
          </tbody>
        </table></div>

        <h3>พื้นฐานเบรดบอร์ด</h3>
        <p>เบรดบอร์ดต่ออุปกรณ์เข้าด้วยกันโดยไม่ต้องบัดกรี - เคล็ดลับทั้งหมดคือต้องรู้ว่ารูไหนต่อถึงกันทางไฟฟ้า แต่ละคอลัมน์แนวตั้งสั้น ๆ ที่มี 5 รูในกริดหลักต่อถึงกันและแยกจากคอลัมน์อื่นทุกคอลัมน์ เสียบอุปกรณ์สองตัวลงคอลัมน์เดียวกันคือต่อสายถึงกันแล้ว รางไฟด้านบนและล่างของบอร์ดวิ่งยาวตลอดทั้งบอร์ดแทน - ทุกรูบนรางเดียวกันคือโหนดเดียวกัน ซึ่งเป็นเหตุผลที่มันเป็นจุดธรรมชาติสำหรับเดินสาย 5V และ GND ที่ใช้ร่วมกัน</p>

        <h3>Arduino IDE และโครงสร้าง Sketch</h3>
        <p>เริ่มต้น: ติดตั้ง Arduino IDE ต่อบอร์ดผ่าน USB เลือกบอร์ดที่ถูกต้องใน Tools &rarr; Board และพอร์ต COM ที่ถูกต้องใน Tools &rarr; Port แล้วเขียนหรือเปิด sketch <code>.ino</code> แล้วกด Upload ทุก sketch ต้องมีสองฟังก์ชันเสมอ - <code>setup()</code> รันครั้งเดียวตอนเปิดเครื่อง (ตั้งค่าโหมดขา, เริ่ม Serial, initialize ไลบรารี) และ <code>loop()</code> รันวนไม่รู้จบหลังจากนั้น ตราบใดที่บอร์ดยังมีไฟเลี้ยง</p>

        <h3>งานแรก: กะพริบ LED</h3>
        <p>LED มีขั้ว - กระแสไหลผ่านขาที่ยาวกว่า (anode) ไปยังขาที่สั้นกว่า (cathode) เท่านั้น ต่อสาย D9 &rarr; ตัวต้านทาน &rarr; LED anode &rarr; LED cathode &rarr; GND:</p>

        <div class="report-diagram">
          <svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg" font-size="8.5" fill="none" stroke="currentColor">
            <defs><marker id="led-arr" markerWidth="5" markerHeight="5" refX="4" refY="2" orient="auto"><polygon points="0,0 5,2 0,4" fill="currentColor" stroke="none"/></marker></defs>
            <rect x="10" y="40" width="55" height="43" rx="5" fill="currentColor" fill-opacity="0.12" stroke-width="1.3"/>
            <text x="37.5" y="59" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">Arduino</text>
            <text x="37.5" y="71" text-anchor="middle" opacity="0.6" font-size="7" stroke="none" fill="currentColor">Uno</text>
            <line x1="65" y1="50" x2="80" y2="50" stroke-width="1.3" stroke-opacity="0.8"/>
            <line x1="65" y1="75" x2="80" y2="75" stroke-width="1.3" stroke-opacity="0.8"/>
            <path d="M 80 50 H 150 V 60" stroke-width="1.3" stroke-opacity="0.8"/>
            <text x="115" y="44" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">D9</text>
            <path d="M 150 60 V 65 L 156 68 L 144 72 L 156 76 L 144 80 L 150 84 V 90" stroke-width="1.3" stroke-opacity="0.8"/>
            <text x="163" y="76" font-weight="700" stroke="none" fill="currentColor">220&#937;</text>
            <path d="M 150 90 V 102 H 190" stroke-width="1.3" stroke-opacity="0.8"/>
            <polygon points="190,96 190,108 204,102" stroke-width="1.3" stroke-opacity="0.8"/>
            <line x1="204" y1="96" x2="204" y2="108" stroke-width="1.8"/>
            <line x1="196" y1="93" x2="200" y2="86" stroke-width="1" marker-end="url(#led-arr)"/>
            <line x1="201" y1="93" x2="205" y2="86" stroke-width="1" marker-end="url(#led-arr)"/>
            <text x="197" y="122" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">LED</text>
            <path d="M 204 102 H 245 V 75 H 80" stroke-width="1.3" stroke-opacity="0.8"/>
            <text x="115" y="90" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">GND</text>
          </svg>
          <figcaption>D9 &rarr; ตัวต้านทาน 220&#937; &rarr; LED (anode ไปทางตัวต้านทาน, cathode ไปทาง GND) &rarr; GND - ตัวต้านทานจำกัดกระแสให้ LED ได้ติดสว่างแทนที่จะไหม้</figcaption>
        </div>

        <p>การข้ามตัวต้านทานไปคือวิธีที่เร็วที่สุดในการทำลาย LED ตัวต้านทานเป็นไปตามกฎของโอห์มแบบเส้นตรง - แรงดันเพิ่มเป็นสองเท่า กระแสก็เพิ่มเป็นสองเท่า - แต่ LED ไม่ทำงานแบบนั้นเลย: ต่ำกว่าแรงดันไปข้างหน้าของมัน (ประมาณ 1.8-3.3V ขึ้นอยู่กับสี) มันแทบไม่นำกระแสเลย และพอเลยจุดนั้นไปนิดเดียว กระแสของมันพุ่งขึ้นสูงชันมากสำหรับแรงดันที่เพิ่มขึ้นเพียงเล็กน้อย ถ้าต่อตรงคร่อม 5V โดยไม่มีอะไรจำกัดมันเลย LED จะพยายามดึงกระแสเท่าที่ขาจะจ่ายให้ได้จริง - เกินพิกัดจริงของมันไปมาก (LED เล็ก ๆ ส่วนใหญ่มีพิกัดราว 20mA) - และมันจะไหม้ภายในเสี้ยววินาที บางครั้งไหม้ทันที ตัวต้านทานอนุกรมคือตัวที่กดกระแสนั้นให้อยู่ในระดับปลอดภัย: ตัวต้านทาน 220&Omega; ตัวเดียวกับในตัวอย่างการคำนวณก่อนหน้านี้ ลดแรงดันส่วนเกินที่ LED ไม่ได้ใช้ แล้วเปลี่ยนมันเป็นความร้อนจำนวนเล็กน้อยที่ไม่เป็นอันตราย แทนที่จะปล่อยให้ LED พยายามกินมันทั้งหมดในรูปกระแส</p>

        <pre class="code-block"><code>const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // on
  delay(1000);
  digitalWrite(LED_PIN, LOW);   // off
  delay(1000);
}</code></pre>

        <h3>Digital Input: ปุ่มกด</h3>
        <p>ต่อด้วย <code>INPUT_PULLUP</code> ปุ่มจะอ่านค่า HIGH ตอนไม่กดและ LOW ตอนกด (active-low ตามด้านบน):</p>
        <pre class="code-block"><code>pinMode(BUTTON_PIN, INPUT_PULLUP);
pinMode(LED_PIN, OUTPUT);
// in loop():
bool pressed = (digitalRead(BUTTON_PIN) == LOW);
digitalWrite(LED_PIN, pressed ? HIGH : LOW);</code></pre>

        <h3>PWM: จำลองแรงดันอนาล็อก</h3>
        <p>ขา digital เป็นได้แค่ HIGH เต็มหรือ LOW เต็มเท่านั้น - ไม่มี "ครึ่งแรงดัน" PWM จำลองระดับกลาง ๆ โดยสวิตช์ขาเปิด/ปิดเร็วมาก - ยิ่งแต่ละไซเคิลใช้เวลาเป็น HIGH มากเท่าไหร่ (duty cycle) แรงดันที่ LED, มอเตอร์ หรือเซอร์โวเห็นก็ยิ่งดูสูงขึ้นเท่านั้น มีแค่ขาที่มีเครื่องหมาย ~ เท่านั้นที่รองรับ ผ่าน <code>analogWrite(pin, value)</code> โดย value มีค่าตั้งแต่ 0 (ปิดตลอด) ถึง 255 (เปิดตลอด)</p>

        <h3>มอเตอร์เซอร์โว</h3>
        <p>เซอร์โวค้างมุมที่แน่นอนไว้ (0&deg;-180&deg;) แทนที่จะหมุนต่อเนื่อง - มีสามสาย: ไฟเลี้ยง (แดง, 5V), กราวด์ (น้ำตาล/ดำ) และสัญญาณ (ส้ม/เหลือง, ขา PWM) เซอร์โวที่มีโหลดอาจดึงกระแสพุ่งสูงชั่วขณะมากพอที่จะทำให้ตัวปรับแรงดัน 5V ในบอร์ดตกและรีเซ็ตเครื่องแบบสุ่มได้ - สำหรับเซอร์โวมากกว่าหนึ่งตัว หรือตัวที่ใหญ่กว่า ให้จ่ายไฟจากแหล่ง 5V แยกที่ใช้ GND ร่วมกับบอร์ดแทน</p>
        <pre class="code-block"><code>#include &lt;Servo.h&gt;
Servo myServo;

void setup() {
  myServo.attach(9);  // signal wire
}
void loop() {
  myServo.write(90);  // move to 90 degrees
}</code></pre>

        <h3>เซนเซอร์วัดระยะอัลตราโซนิก (HC-SR04)</h3>
        <p>ส่งพัลส์จาก TRIG จับเวลาว่า ECHO ใช้เวลานานแค่ไหนกว่าจะเห็นมันสะท้อนกลับมา แล้วแปลงเวลาไป-กลับนั้นเป็นระยะทางด้วยความเร็วเสียง (&asymp;0.0343 cm/&micro;s) หารด้วย 2 เพราะพัลส์เดินทางทั้งไปและกลับ: <strong>d = (t &times; 0.0343) / 2</strong></p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ขาเซนเซอร์</th><th>ต่อกับ</th></tr></thead>
          <tbody>
            <tr><td>TRIG</td><td>ขา digital ใดก็ได้ ตั้งเป็น OUTPUT</td></tr>
            <tr><td>ECHO</td><td>ขา digital ใดก็ได้ ตั้งเป็น INPUT</td></tr>
          </tbody>
        </table></div>

        <h3>I2C: รัน LCD ด้วย 4 สาย</h3>
        <p>I2C เป็นโปรโตคอลสองสาย - แทนที่จะใช้หนึ่งขาต่อหนึ่งสัญญาณ อุปกรณ์หลายตัวใช้ <strong>SDA</strong> (ข้อมูล) และ <strong>SCL</strong> (สัญญาณนาฬิกา) ร่วมกัน จอ LCD ตัวอักษร 16x2 ต้องการแค่ 4 สายรวม (ไฟเลี้ยง, กราวด์, SDA, SCL) แม้จะมีวงจรภายในซับซ้อนกว่า LED ตัวเดียวมาก และอุปกรณ์ I2C หลายตัวสามารถใช้สายบัสสองเส้นเดียวกันได้ ตราบใดที่ไม่มีสองตัวใช้ address เดียวกัน</p>

        <h3>ก้าวต่อไป</h3>
        <p>การรวมหลาย ๆ ส่วนนี้เข้าเป็นโปรเจกต์เดียว (ปุ่มที่เปลี่ยนตำแหน่งเซอร์โว, ค่าเซนเซอร์ที่ส่งไปแสดงบน LCD, ความสว่างที่ควบคุมด้วย PWM ตอบสนองต่อเซนเซอร์วัดระยะ) คือก้าวต่อไปตามธรรมชาติก่อนจะไปสู่งานหุ่นยนต์ที่ขับเคลื่อนด้วยจลนศาสตร์ที่ซับซ้อนกว่า - ดูรายงาน <a href="report.html?id=physics-robotics">Physics in Robotics</a> สำหรับทิศทางที่ต่อยอดจากตรงนี้</p>
      `,
    },
  },

  "line-chatbot": {
    icon: "bi-chat-dots-fill",
    backAnchor: "m4",
    en: {
      eyebrow: "M.4 · Reports & Docs",
      date: "Semester 1",
      title: "LINE Chatbot with Dialogflow & Apps Script",
      meta: "A real inventory-tracking bot: Dialogflow intents, an Apps Script webhook, Sheets as the database, and Flex Message cards.",
      body: `
        <p>A guide to the full pipeline behind a real inventory-tracking LINE chatbot (<a href="https://github.com/eai-spsm/M.4-Classwork" target="_blank" rel="noopener">eai-spsm/M.4-Classwork</a>) - room booking, activity logs, and admin item registration, all running through five services chained together.</p>

        <h3>System Architecture</h3>
        <p>A LINE chatbot is rarely just "one program" - it's a chain of services that each do one job, and understanding the chain is the key to debugging it later: if the bot doesn't reply, check each link until you find where the message stopped.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Layer</th><th>Job</th></tr></thead>
          <tbody>
            <tr><td>LINE Messaging API</td><td>Delivers messages between the user's LINE app and the bot's backend</td></tr>
            <tr><td>Dialogflow</td><td>Reads the raw text, figures out what the user wants (the intent), pulls out any parameters, forwards it to the webhook</td></tr>
            <tr><td>Google Apps Script</td><td>The actual program logic - reads the intent, does the work (check stock, book a room), builds the reply</td></tr>
            <tr><td>Google Sheets</td><td>A free, easy-to-inspect database - every row a record, every column a field</td></tr>
          </tbody>
        </table></div>
        <p>The chain runs: User &rarr; LINE Messaging API &rarr; Dialogflow &rarr; Apps Script webhook &rarr; Google Sheets, and the reply travels back the same chain in reverse.</p>

        <h3>LINE Official Account &amp; Messaging API</h3>
        <p>Everything starts with a LINE Official Account - the "business account" users add as a friend. A Messaging API channel attached to it (created in the LINE Developers console) is what lets code send and receive messages on its behalf, giving a Channel ID, Channel Secret, and a long-lived Channel Access Token. The default greeting/auto-reply messages need to be turned off in the Official Account Manager so they don't interfere with the bot's own replies.</p>

        <h3>Dialogflow Intents</h3>
        <p>An intent is a single thing the bot knows how to recognize - "check stock," "book a room." Each intent has a list of training phrases (example things a user might type), and Dialogflow's NLP matches new messages against the closest intent even if the wording isn't exact. For a project like this, it's often simpler to keep Dialogflow's own job light: detect that the user wants to run some command, and let a single catch-all intent forward the raw message text to the webhook, which then parses it itself - Dialogflow does the routing, Apps Script does the parsing.</p>

        <h3>The Fulfillment Webhook (Google Apps Script)</h3>
        <p>A webhook is just a URL Dialogflow sends an HTTP POST to whenever an intent with fulfillment enabled is matched. Apps Script is a good fit since it deploys as a public Web App URL for free and has built-in Sheets access. The core function, <code>doPost(e)</code>, gets called automatically on every POST:</p>
        <pre class="code-block"><code>function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var userMsg = data.originalDetectIntentRequest.payload.data.message.text;

  var command = userMsg.split(',');  // e.g. "add,5,10"
  // ...look up the row by ID, update the quantity...

  return buildReply("Stock updated");
}</code></pre>
        <p>Deployed via Deploy &rarr; New deployment &rarr; Web app, with "Execute as: Me" and "Who has access: Anyone," then that URL gets pasted into Dialogflow's Fulfillment tab.</p>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>Redeploy after every change:</strong> editing the Apps Script code does not update the live Web App URL automatically - a new deployment version has to be created each time, or Dialogflow keeps calling the old, unchanged code.</div></div>

        <h3>Google Sheets as the Database</h3>
        <p>No SQL server needed - a spreadsheet works fine for a classroom-scale bot and is trivial to inspect or edit by hand. The real project uses three tabs: an Inventory sheet (ID, Name, Category, Quantity, Image URL) for current stock, an Equip Log (User ID, Item ID, Qty, Timestamp, Action) for every borrow/return event, and a Room Log for room bookings. Logging every transaction to its own row - rather than overwriting a single "status" cell - keeps a full history, useful for "show my logs" and for catching mistakes after the fact.</p>

        <h3>Rich Replies: Flex Messages</h3>
        <p>A plain text reply works, but LINE's Flex Message format replies with an actual card - image, title, details, buttons - built from a JSON structure of nested boxes. Dialogflow forwards the webhook's JSON straight to LINE as long as it's wrapped in a <code>"platform": "line"</code> payload, which matters because Dialogflow supports many chat platforms from one fulfillment response - the same webhook could return a different format for, say, a website widget.</p>

        <h3>End-to-End: "Check Stock"</h3>
        <p>Putting it all together for a real command, <code>Check,5</code>:</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Step</th><th>What happens</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>User types <code>Check,5</code> in LINE</td></tr>
            <tr><td>2</td><td>LINE forwards it to Dialogflow via the Messaging API integration</td></tr>
            <tr><td>3</td><td>Dialogflow's catch-all intent matches, fulfillment POSTs the raw text to the webhook</td></tr>
            <tr><td>4</td><td><code>doPost(e)</code> splits the text, looks up row where ID = 5 in the Inventory sheet</td></tr>
            <tr><td>5</td><td>Reads that row's Name, Quantity, and Image URL, calls <code>buildReply()</code> to build the Flex card</td></tr>
            <tr><td>6</td><td>JSON reply flows back through Apps Script &rarr; Dialogflow &rarr; LINE &rarr; the user sees a card with the item's photo and stock count</td></tr>
          </tbody>
        </table></div>

        <h3>Where Chatbots Actually Came From</h3>
        <p>The field went through several completely different approaches to the same problem, each a reaction to the limits of the last. <strong>ELIZA</strong> (1966, MIT) had no real language understanding at all - it matched keywords and reflected the user's sentence back as a question. <strong>Rule-based systems</strong> (1970s-90s) scaled that up into bigger hand-written rule lists, but broke on any phrasing the author hadn't anticipated. <strong>Statistical/ML-based NLP</strong> (2000s-2010s) is the era Dialogflow belongs to - trained on example phrases, it learns to generalize rather than needing every possible wording written by hand. <strong>Transformer models &amp; LLMs</strong> (2017-present, after the "Attention Is All You Need" paper) don't just classify intents - they generate full original responses by predicting likely next words.</p>
        <p>Dialogflow sits deliberately in the middle: more flexible than hard-coded keyword rules, far more predictable and cheaper to run than a full LLM. A command like <code>Check,5</code> needs one exact, predictable outcome every time, not a creative response - which is exactly why an inventory bot uses intent-matching instead of a general-purpose LLM. ML-based matching is the right tool whenever the set of things a bot needs to do is fixed and known in advance (booking, ordering, FAQs); LLMs are for when the conversation itself is the open-ended part.</p>

        <div class="comp-links">
          <a href="https://github.com/eai-spsm/M.4-Classwork" target="_blank" rel="noopener" class="event-fb"><i class="bi bi-github"></i><span>View on GitHub</span></a>
        </div>
      `,
    },
    th: {
      eyebrow: "ม.4 · งานในชั้นเรียน",
      date: "เทอม 1",
      title: "LINE Chatbot ด้วย Dialogflow และ Apps Script",
      meta: "บอทติดตามสต็อกของจริง: intent ของ Dialogflow, webhook ของ Apps Script, Sheets เป็นฐานข้อมูล และการ์ด Flex Message",
      body: `
        <p>แนวทางเต็ม pipeline เบื้องหลังบอท LINE ติดตามสต็อกของจริง (<a href="https://github.com/eai-spsm/M.4-Classwork" target="_blank" rel="noopener">eai-spsm/M.4-Classwork</a>) - จองห้อง บันทึกกิจกรรม และการลงทะเบียนสินค้าโดยแอดมิน ทั้งหมดวิ่งผ่านห้าบริการที่เชื่อมต่อกัน</p>

        <h3>สถาปัตยกรรมระบบ</h3>
        <p>LINE chatbot แทบไม่เคยเป็นแค่ "โปรแกรมเดียว" - มันคือชุดบริการที่แต่ละตัวทำหน้าที่เดียว และการเข้าใจห่วงโซ่นี้คือกุญแจในการดีบั๊กภายหลัง: ถ้าบอทไม่ตอบ ให้เช็คทีละจุดเชื่อมจนกว่าจะพบว่าข้อความหยุดตรงไหน</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ชั้น</th><th>หน้าที่</th></tr></thead>
          <tbody>
            <tr><td>LINE Messaging API</td><td>ส่งข้อความระหว่างแอป LINE ของผู้ใช้กับ backend ของบอท</td></tr>
            <tr><td>Dialogflow</td><td>อ่านข้อความดิบ หาว่าผู้ใช้ต้องการอะไร (intent) ดึงพารามิเตอร์ออกมา แล้วส่งต่อไปยัง webhook</td></tr>
            <tr><td>Google Apps Script</td><td>ตรรกะโปรแกรมจริง - อ่าน intent ทำงาน (เช็คสต็อก, จองห้อง) สร้างคำตอบ</td></tr>
            <tr><td>Google Sheets</td><td>ฐานข้อมูลฟรีที่ตรวจสอบได้ง่าย - แต่ละแถวคือหนึ่ง record แต่ละคอลัมน์คือหนึ่ง field</td></tr>
          </tbody>
        </table></div>
        <p>ห่วงโซ่ทำงานเป็น: ผู้ใช้ &rarr; LINE Messaging API &rarr; Dialogflow &rarr; Apps Script webhook &rarr; Google Sheets และคำตอบเดินทางกลับตามห่วงโซ่เดิมในทิศทางย้อนกลับ</p>

        <h3>LINE Official Account และ Messaging API</h3>
        <p>ทุกอย่างเริ่มจาก LINE Official Account - "บัญชีธุรกิจ" ที่ผู้ใช้เพิ่มเป็นเพื่อน ช่อง Messaging API ที่ผูกกับมัน (สร้างใน LINE Developers console) คือสิ่งที่ทำให้โค้ดส่งและรับข้อความแทนบัญชีนั้นได้ โดยได้ Channel ID, Channel Secret และ Channel Access Token แบบอายุยาว ข้อความทักทาย/ตอบกลับอัตโนมัติเริ่มต้นต้องปิดใน Official Account Manager เพื่อไม่ให้ไปรบกวนคำตอบของบอทเอง</p>

        <h3>Intent ของ Dialogflow</h3>
        <p>Intent คือสิ่งเดียวที่บอทรู้วิธีจดจำ - "เช็คสต็อก", "จองห้อง" แต่ละ intent มีรายการ training phrase (ตัวอย่างสิ่งที่ผู้ใช้อาจพิมพ์) และ NLP ของ Dialogflow จะจับคู่ข้อความใหม่กับ intent ที่ใกล้เคียงที่สุดแม้คำจะไม่ตรงเป๊ะ สำหรับโปรเจกต์แบบนี้ มักง่ายกว่าถ้าให้งานของ Dialogflow เองเบา ๆ ไว้: ตรวจจับแค่ว่าผู้ใช้ต้องการรันคำสั่งบางอย่าง แล้วให้ intent แบบ catch-all ตัวเดียวส่งข้อความดิบต่อไปยัง webhook ซึ่งจะแยกวิเคราะห์เอง - Dialogflow ทำหน้าที่ routing ส่วน Apps Script ทำหน้าที่ parsing</p>

        <h3>Webhook Fulfillment (Google Apps Script)</h3>
        <p>Webhook ก็แค่ URL ที่ Dialogflow ส่ง HTTP POST ไปทุกครั้งที่มีการจับคู่ intent ที่เปิดใช้ fulfillment ไว้ Apps Script เหมาะมากเพราะ deploy เป็น Web App URL สาธารณะได้ฟรีและเข้าถึง Sheets ได้ในตัว ฟังก์ชันหลัก <code>doPost(e)</code> จะถูกเรียกอัตโนมัติทุกครั้งที่มี POST:</p>
        <pre class="code-block"><code>function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var userMsg = data.originalDetectIntentRequest.payload.data.message.text;

  var command = userMsg.split(',');  // e.g. "add,5,10"
  // ...look up the row by ID, update the quantity...

  return buildReply("Stock updated");
}</code></pre>
        <p>Deploy ผ่าน Deploy &rarr; New deployment &rarr; Web app โดยตั้ง "Execute as: Me" และ "Who has access: Anyone" แล้ววาง URL นั้นลงในแท็บ Fulfillment ของ Dialogflow</p>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>ต้อง redeploy ทุกครั้งที่แก้โค้ด:</strong> การแก้โค้ด Apps Script ไม่อัปเดต Web App URL ที่ใช้งานจริงให้อัตโนมัติ - ต้องสร้าง deployment version ใหม่ทุกครั้ง ไม่งั้น Dialogflow จะยังเรียกโค้ดเก่าที่ไม่ได้แก้อยู่</div></div>

        <h3>Google Sheets เป็นฐานข้อมูล</h3>
        <p>ไม่ต้องมีเซิร์ฟเวอร์ SQL - สเปรดชีตใช้งานได้ดีสำหรับบอทระดับห้องเรียน และตรวจสอบหรือแก้ไขด้วยมือได้ง่ายมาก โปรเจกต์จริงใช้สามแท็บ: ชีต Inventory (ID, Name, Category, Quantity, Image URL) สำหรับสต็อกปัจจุบัน, Equip Log (User ID, Item ID, Qty, Timestamp, Action) สำหรับทุกเหตุการณ์ยืม/คืน และ Room Log สำหรับการจองห้อง การบันทึกทุกธุรกรรมเป็นแถวของตัวเอง - แทนที่จะเขียนทับเซลล์ "status" เดียว - ทำให้มีประวัติครบถ้วน มีประโยชน์ทั้งสำหรับ "ดูประวัติของฉัน" และการตรวจจับข้อผิดพลาดภายหลัง</p>

        <h3>คำตอบแบบสมบูรณ์: Flex Message</h3>
        <p>ข้อความตัวอักษรธรรมดาก็ใช้ได้ แต่ฟอร์แมต Flex Message ของ LINE ตอบกลับด้วยการ์ดจริง - รูปภาพ, ชื่อเรื่อง, รายละเอียด, ปุ่ม - สร้างจากโครงสร้าง JSON ของกล่องซ้อนกัน Dialogflow ส่ง JSON ของ webhook ต่อให้ LINE โดยตรงตราบใดที่ห่อไว้ใน payload แบบ <code>"platform": "line"</code> ซึ่งสำคัญเพราะ Dialogflow รองรับแพลตฟอร์มแชทหลายตัวจาก fulfillment response เดียว - webhook เดียวกันสามารถคืนฟอร์แมตต่างออกไปได้ เช่นสำหรับวิดเจ็ตบนเว็บไซต์</p>

        <h3>ตั้งแต่ต้นจนจบ: "Check Stock"</h3>
        <p>รวมทุกอย่างเข้าด้วยกันสำหรับคำสั่งจริงหนึ่งอัน <code>Check,5</code>:</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ขั้นตอน</th><th>สิ่งที่เกิดขึ้น</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>ผู้ใช้พิมพ์ <code>Check,5</code> ใน LINE</td></tr>
            <tr><td>2</td><td>LINE ส่งต่อไปยัง Dialogflow ผ่านการเชื่อมต่อ Messaging API</td></tr>
            <tr><td>3</td><td>Intent แบบ catch-all ของ Dialogflow จับคู่ได้ fulfillment ส่งข้อความดิบเป็น POST ไปยัง webhook</td></tr>
            <tr><td>4</td><td><code>doPost(e)</code> แยกข้อความ ค้นหาแถวที่ ID = 5 ในชีต Inventory</td></tr>
            <tr><td>5</td><td>อ่าน Name, Quantity และ Image URL ของแถวนั้น เรียก <code>buildReply()</code> เพื่อสร้างการ์ด Flex</td></tr>
            <tr><td>6</td><td>คำตอบ JSON ไหลกลับผ่าน Apps Script &rarr; Dialogflow &rarr; LINE &rarr; ผู้ใช้เห็นการ์ดที่มีรูปสินค้าและจำนวนสต็อก</td></tr>
          </tbody>
        </table></div>

        <h3>chatbot มาจากไหนกันแน่</h3>
        <p>วงการนี้ผ่านแนวทางที่ต่างกันโดยสิ้นเชิงมาหลายแบบสำหรับปัญหาเดียวกัน แต่ละแบบเป็นปฏิกิริยาต่อข้อจำกัดของแบบก่อนหน้า <strong>ELIZA</strong> (1966, MIT) ไม่มีความเข้าใจภาษาจริง ๆ เลย - มันจับคู่คำสำคัญแล้วสะท้อนประโยคของผู้ใช้กลับมาเป็นคำถาม <strong>ระบบ rule-based</strong> (ทศวรรษ 1970-90) ขยายแนวคิดนั้นเป็นรายการกฎที่เขียนด้วยมือขนาดใหญ่ขึ้น แต่พังทันทีที่เจอคำพูดที่ผู้เขียนไม่ได้คาดไว้ <strong>NLP แบบ Statistical/ML-based</strong> (ทศวรรษ 2000-2010) คือยุคที่ Dialogflow อยู่ - เทรนจากตัวอย่างประโยค มันเรียนรู้ที่จะ generalize แทนที่จะต้องเขียนทุกคำพูดที่เป็นไปได้ด้วยมือ <strong>Transformer และ LLM</strong> (2017-ปัจจุบัน หลังเปเปอร์ "Attention Is All You Need") ไม่ได้แค่จำแนก intent เท่านั้น - มันสร้างคำตอบต้นฉบับเต็มรูปแบบด้วยการทำนายคำถัดไปที่น่าจะเป็น</p>
        <p>Dialogflow อยู่ตรงกลางโดยตั้งใจ: ยืดหยุ่นกว่ากฎคำสำคัญที่เขียนตายตัว แต่คาดเดาผลได้และรันถูกกว่า LLM เต็มรูปแบบมาก คำสั่งอย่าง <code>Check,5</code> ต้องการผลลัพธ์เดียวที่แน่นอนและคาดเดาได้ทุกครั้ง ไม่ใช่คำตอบเชิงสร้างสรรค์ - ซึ่งเป็นเหตุผลพอดีที่บอทสต็อกใช้การจับคู่ intent แทนที่จะใช้ LLM อเนกประสงค์ การจับคู่ด้วย ML คือเครื่องมือที่ถูกต้องเมื่อชุดสิ่งที่บอทต้องทำนั้นตายตัวและรู้ล่วงหน้า (จอง, สั่งของ, FAQ); ส่วน LLM เหมาะกับตอนที่ตัวบทสนทนาเองเป็นส่วนที่เปิดกว้าง</p>

        <div class="comp-links">
          <a href="https://github.com/eai-spsm/M.4-Classwork" target="_blank" rel="noopener" class="event-fb"><i class="bi bi-github"></i><span>ดูซอร์สโค้ดบน GitHub</span></a>
        </div>
      `,
    },
  },

  "deep-learning": {
    icon: "bi-diagram-2-fill",
    backAnchor: "m5",
    en: {
      eyebrow: "M.5 · Reports & Docs",
      date: "Semester 1",
      title: "Deep Learning: From AI to LLMs",
      meta: "AI vs ML vs DL, neural network anatomy, CNN/RNN/Transformer/LLM, and how training, epochs, F1, and overfitting actually work.",
      body: `
        <p>A guide to the vocabulary and math behind every AI conversation - what AI, ML, and Deep Learning actually mean as nested ideas, how a neural network is built out of weights, and what's really happening when a model "trains for 10 epochs" or scores an "F1 of 0.8."</p>

        <h3>AI vs. Machine Learning vs. Deep Learning</h3>
        <p>These three terms get used almost interchangeably, but they describe nested, increasingly specific ideas - not three different things.</p>
        <div class="report-diagram">
          <svg viewBox="0 0 220 230" xmlns="http://www.w3.org/2000/svg">
            <circle cx="110" cy="120" r="100" fill="currentColor" fill-opacity="0.05" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.3"/>
            <circle cx="110" cy="120" r="68" fill="currentColor" fill-opacity="0.09" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.3"/>
            <circle cx="110" cy="120" r="36" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.3"/>
            <text x="110" y="44" text-anchor="middle" font-size="11" font-weight="700" stroke="none" fill="currentColor">AI</text>
            <text x="110" y="74" text-anchor="middle" font-size="10.5" font-weight="700" stroke="none" fill="currentColor" opacity="0.85">ML</text>
            <text x="110" y="123" text-anchor="middle" font-size="10.5" font-weight="700" stroke="none" fill="currentColor">DL</text>
          </svg>
          <figcaption>Each ring sits entirely inside the one before it - every Deep Learning system is Machine Learning, and every Machine Learning system is AI, but not the other way around.</figcaption>
        </div>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Term</th><th>Definition</th><th>Example</th></tr></thead>
          <tbody>
            <tr><td>Artificial Intelligence</td><td>Any technique that makes a computer act "intelligently" - including plain hand-written rules, no learning required</td><td>A chess engine with hard-coded rules</td></tr>
            <tr><td>Machine Learning</td><td>A subset of AI where the system learns its own rules from data instead of a human writing them by hand</td><td>A spam filter trained on labeled emails</td></tr>
            <tr><td>Deep Learning</td><td>A subset of ML that uses neural networks with many layers ("deep") to learn very complex patterns</td><td>Image recognition, ChatGPT-style models</td></tr>
          </tbody>
        </table></div>
        <p>A chess engine that brute-force searches millions of moves using hand-written rules is AI, but not machine learning - it never trains on data or improves from experience. The defining feature of ML specifically is that behavior comes from data, not a programmer writing every rule by hand.</p>

        <h3>Neural Networks: Weights, Bias &amp; Layers</h3>
        <p>A neural network is built from layers of simple units ("neurons"). Every connection between neurons carries a <strong>weight</strong> - a number saying how strongly that input should influence the next neuron. Training a model is really just the process of finding good values for every weight in the network.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Term</th><th>What it is</th></tr></thead>
          <tbody>
            <tr><td>Neuron</td><td>A simple unit that takes inputs, combines them, and passes a result onward</td></tr>
            <tr><td>Weight</td><td>A number on each connection controlling how much that input matters - a bigger magnitude means stronger influence</td></tr>
            <tr><td>Bias</td><td>An extra adjustable number added to a neuron's output, independent of any input - shifts the result up or down</td></tr>
            <tr><td>Parameters</td><td>All the weights and biases in the model, combined - a model with "175 billion parameters" has that many learnable numbers</td></tr>
            <tr><td>Layer</td><td>A group of neurons processed together - input layer, one or more hidden layers, output layer</td></tr>
            <tr><td>Activation function</td><td>A small function (e.g. ReLU) applied to a neuron's output, letting the network learn non-linear, more complex patterns</td></tr>
          </tbody>
        </table></div>
        <p>Without an activation function, stacking layers would be pointless - a chain of plain weighted sums collapses mathematically into one single weighted sum no matter how many layers get added. The activation function is what lets each layer learn something genuinely new from the last.</p>

        <h3>Activation Functions: ReLU, Sigmoid &amp; Tanh</h3>
        <div class="report-diagram">
          <svg viewBox="0 0 380 100" xmlns="http://www.w3.org/2000/svg" font-size="8" fill="none" stroke="currentColor">
            <g transform="translate(0,0)">
              <line x1="5" y1="50" x2="105" y2="50" stroke-width="1" stroke-opacity="0.25"/>
              <line x1="55" y1="8" x2="55" y2="88" stroke-width="1" stroke-opacity="0.25"/>
              <path d="M10,50 L55,50 L100,12" stroke-width="1.8" stroke-opacity="0.9"/>
              <text x="55" y="98" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">ReLU</text>
            </g>
            <g transform="translate(135,0)">
              <line x1="5" y1="50" x2="105" y2="50" stroke-width="1" stroke-opacity="0.25"/>
              <line x1="55" y1="8" x2="55" y2="88" stroke-width="1" stroke-opacity="0.25"/>
              <path d="M10,82 C35,82 48,82 55,50 C62,18 75,18 100,18" stroke-width="1.8" stroke-opacity="0.9"/>
              <text x="55" y="98" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">Sigmoid</text>
            </g>
            <g transform="translate(270,0)">
              <line x1="5" y1="50" x2="105" y2="50" stroke-width="1" stroke-opacity="0.25"/>
              <line x1="55" y1="8" x2="55" y2="88" stroke-width="1" stroke-opacity="0.25"/>
              <path d="M10,84 C35,84 48,84 55,50 C62,16 75,16 100,16" stroke-width="1.8" stroke-opacity="0.9"/>
              <text x="55" y="98" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">Tanh</text>
            </g>
          </svg>
          <figcaption>ReLU: flat at 0, then rises straight. Sigmoid: squashes everything into 0 to 1. Tanh: same S-shape but centered at 0, ranging -1 to 1.</figcaption>
        </div>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Function</th><th>Shape</th><th>Typical use</th></tr></thead>
          <tbody>
            <tr><td>ReLU - <code>max(0, x)</code></td><td>0 for negative input, rises linearly after</td><td>Default for hidden layers - fast to compute, avoids the "vanishing gradient" problem</td></tr>
            <tr><td>Sigmoid - <code>1/(1+e&#8315;&#775;)</code></td><td>S-curve, squashes any input into (0, 1)</td><td>Output layer of a binary classifier - the result reads directly as a probability</td></tr>
            <tr><td>Tanh</td><td>S-curve, squashes any input into (-1, 1)</td><td>Similar to sigmoid but zero-centered - was common in older hidden layers, mostly replaced by ReLU now</td></tr>
            <tr><td>Softmax</td><td>Turns a whole layer of numbers into a probability distribution that sums to 1</td><td>Output layer of a multi-class classifier - picking one out of several categories</td></tr>
          </tbody>
        </table></div>
        <div class="report-warn"><i class="bi bi-lightbulb"></i><div><strong>What a beginner actually needs to remember:</strong> for hidden layers, default to ReLU and don't overthink it - it's the standard choice almost everywhere. The activation that actually matters to get right is the <em>output</em> layer, and it's chosen to match the task, not picked freely: sigmoid for a yes/no question, softmax when choosing one class out of several, and often no activation at all (just the raw number) when predicting a continuous value like a price or a distance.</div></div>

        <h3>How Training Actually Works</h3>
        <p>Training is a loop, repeated thousands of times, that nudges every weight a tiny bit closer to "correct."</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Step</th><th>What happens</th></tr></thead>
          <tbody>
            <tr><td>1. Forward pass</td><td>Feed input data through the network using its current weights to get a prediction</td></tr>
            <tr><td>2. Loss</td><td>Compare the prediction to the correct answer with a loss function - a single number that's high when wrong, low when right</td></tr>
            <tr><td>3. Backpropagation</td><td>Work backwards through the network, calculating how much each individual weight contributed to the error</td></tr>
            <tr><td>4. Gradient descent</td><td>Nudge every weight slightly in the direction that reduces the loss, scaled by the learning rate</td></tr>
          </tbody>
        </table></div>
        <p>The <strong>learning rate</strong> is the step size: too high and training overshoots and never settles, too low and training crawls and takes forever.</p>

        <h3>Epoch, Batch Size &amp; Iterations</h3>
        <p>A model rarely trains on its entire dataset in one giant step - it's broken into chunks, and these three terms describe exactly how that chunking works.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Term</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td>Batch size</td><td>How many training examples are processed together before the weights get updated once (e.g. 32)</td></tr>
            <tr><td>Iteration</td><td>One weight-update step - processing exactly one batch</td></tr>
            <tr><td>Epoch</td><td>One complete pass through the entire training set - made up of many iterations</td></tr>
          </tbody>
        </table></div>
        <p><em>Worked example:</em> a training set has 1,000 examples, batch size is 50. Iterations per epoch = 1000 / 50 = <strong>20</strong>. The model updates its weights 20 times to complete one full pass, and training for "10 epochs" means repeating that entire 20-iteration pass 10 times. Smaller batches (8-32) are faster per step and need less memory but more total iterations; larger batches (512+) give more stable updates but need more memory and can generalize slightly worse.</p>

        <h3>Architectures: MLP, CNN, RNN, Transformer &amp; LLM</h3>
        <p>The basic shape above - every neuron connected to every neuron in the next layer - is called an <strong>MLP</strong> (Multi-Layer Perceptron). It works for simple problems, but the field grew specialized variants once people tackled harder tasks like images, language, and long sequences.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Architecture</th><th>What it's built for</th><th>Real-world example</th></tr></thead>
          <tbody>
            <tr><td>MLP</td><td>General-purpose, fully-connected layers - works on simple, fixed-size, tabular input</td><td>Predicting house prices from numeric features</td></tr>
            <tr><td>CNN (Convolutional Neural Network)</td><td>Scans small filters across grid-like data to detect local patterns (edges, shapes, textures) - the backbone of computer vision</td><td>Face detection, photo classification</td></tr>
            <tr><td>RNN (Recurrent Neural Network)</td><td>Processes a sequence one step at a time, feeding its own previous output back in as "memory" of what came before</td><td>Older speech recognition, simple time-series prediction</td></tr>
            <tr><td>Transformer</td><td>Uses an attention mechanism to weigh how every part of the input relates to every other part, all at once - much faster to train in parallel than an RNN</td><td>Google Translate, modern speech and language models</td></tr>
            <tr><td>LLM (Large Language Model)</td><td>A transformer trained on enormous amounts of text, with parameter counts in the billions - large enough to generalize to open-ended conversation</td><td>ChatGPT, Claude, Gemini</td></tr>
          </tbody>
        </table></div>
        <p>Computer vision isn't a separate kind of AI - it's a task (getting a computer to interpret images), and CNNs are simply the architecture that turned out best suited for it, the same way Transformers turned out best suited for language. And "classical" computer vision that hand-engineers features first (edge detection, color histograms) then feeds those into a standard classifier is still basic ML wearing a computer-vision hat - the deep-learning version specifically means the model learns its own features straight from raw pixels, no manual feature-engineering step at all.</p>

        <h3>Not Everything Is a Neural Network: Decision Trees</h3>
        <p>Before reaching for deep learning, plenty of real problems are solved better and faster by much simpler models - a <strong>decision tree</strong> being the clearest example. Instead of layers of weights, it's a flowchart of yes/no questions learned from the data: at each node it picks the single feature and threshold that best splits the data into purer groups, then repeats on each resulting branch until the leaves are mostly one class.</p>
        <div class="report-diagram">
          <svg viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg" font-size="8.5" fill="none" stroke="currentColor">
            <rect x="90" y="6" width="80" height="26" rx="5" stroke-width="1.2" stroke-opacity="0.85"/>
            <text x="130" y="23" text-anchor="middle" stroke="none" fill="currentColor">age &lt; 30?</text>
            <line x1="110" y1="32" x2="60" y2="58" stroke-width="1.2" stroke-opacity="0.7"/>
            <text x="72" y="48" stroke="none" fill="currentColor" opacity="0.65">yes</text>
            <line x1="150" y1="32" x2="200" y2="58" stroke-width="1.2" stroke-opacity="0.7"/>
            <text x="178" y="48" stroke="none" fill="currentColor" opacity="0.65">no</text>
            <rect x="20" y="58" width="80" height="26" rx="5" stroke-width="1.2" stroke-opacity="0.85"/>
            <text x="60" y="75" text-anchor="middle" stroke="none" fill="currentColor">income &lt; 20k?</text>
            <rect x="160" y="58" width="80" height="26" rx="5" stroke-width="1.2" stroke-opacity="0.85"/>
            <text x="200" y="75" text-anchor="middle" stroke="none" fill="currentColor">credit &gt; 700?</text>
            <line x1="40" y1="84" x2="25" y2="110" stroke-width="1.2" stroke-opacity="0.6"/>
            <line x1="80" y1="84" x2="95" y2="110" stroke-width="1.2" stroke-opacity="0.6"/>
            <line x1="180" y1="84" x2="165" y2="110" stroke-width="1.2" stroke-opacity="0.6"/>
            <line x1="220" y1="84" x2="235" y2="110" stroke-width="1.2" stroke-opacity="0.6"/>
            <rect x="2" y="110" width="46" height="24" rx="5" fill="currentColor" fill-opacity="0.15" stroke-width="1.2"/>
            <text x="25" y="126" text-anchor="middle" stroke="none" fill="currentColor" font-weight="700">Deny</text>
            <rect x="72" y="110" width="46" height="24" rx="5" fill="currentColor" fill-opacity="0.15" stroke-width="1.2"/>
            <text x="95" y="126" text-anchor="middle" stroke="none" fill="currentColor" font-weight="700">Approve</text>
            <rect x="142" y="110" width="46" height="24" rx="5" fill="currentColor" fill-opacity="0.15" stroke-width="1.2"/>
            <text x="165" y="126" text-anchor="middle" stroke="none" fill="currentColor" font-weight="700">Approve</text>
            <rect x="212" y="110" width="46" height="24" rx="5" fill="currentColor" fill-opacity="0.15" stroke-width="1.2"/>
            <text x="235" y="126" text-anchor="middle" stroke="none" fill="currentColor" font-weight="700">Deny</text>
          </svg>
          <figcaption>A loan-approval decision tree - each internal node is a yes/no split learned from data, each leaf is a final prediction. The whole "model" is just this flowchart.</figcaption>
        </div>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th></th><th>Decision tree</th><th>Neural network</th></tr></thead>
          <tbody>
            <tr><td>How it decides</td><td>A learned sequence of if/else splits on individual features</td><td>Weighted sums passed through activation functions across layers</td></tr>
            <tr><td>Interpretability</td><td>High - the exact reasoning for any prediction can be read off as a path down the tree</td><td>Low - a "black box," hard to explain why a specific prediction came out</td></tr>
            <tr><td>Data needs</td><td>Works fine on small, tabular datasets</td><td>Usually needs much more data to train well, especially for CNNs/Transformers</td></tr>
            <tr><td>Weak spot</td><td>A single deep tree overfits easily - memorizing individual training rows as its own branches</td><td>Overfits too, but has other regularization tools (dropout, data augmentation) available</td></tr>
          </tbody>
        </table></div>
        <p>How a split gets chosen: at each node, the algorithm tries every feature and threshold, and picks whichever split makes the resulting two groups the "purest" - measured by <strong>Gini impurity</strong> or <strong>entropy</strong> (how mixed the classes are within a group; 0 means a group is perfectly one class). A single tree overfits easily, which is why in practice a <strong>Random Forest</strong> - training many trees on random subsets of the data and features, then averaging their votes - is the far more common real-world choice: the individual trees' mistakes tend to cancel out, while their shared correct signal reinforces.</p>

        <h3>Model Evaluation: TP, FP, TN, FN</h3>
        <p>For a binary classifier (sorting into one of two classes, e.g. "spam" vs "not spam"), every prediction falls into exactly one of four buckets, depending on what was predicted versus what was actually true.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Term</th><th>Meaning</th><th>Spam-filter example</th></tr></thead>
          <tbody>
            <tr><td>True Positive (TP)</td><td>Predicted positive, actually positive - a correct "yes"</td><td>Spam correctly flagged as spam</td></tr>
            <tr><td>True Negative (TN)</td><td>Predicted negative, actually negative - a correct "no"</td><td>Real email correctly left alone</td></tr>
            <tr><td>False Positive (FP)</td><td>Predicted positive, actually negative - a wrong alarm</td><td>Real email wrongly flagged as spam</td></tr>
            <tr><td>False Negative (FN)</td><td>Predicted negative, actually positive - a missed case</td><td>Spam that slipped into the inbox</td></tr>
          </tbody>
        </table></div>
        <p>"False" describes the prediction, not reality - a False Positive means the model's positive prediction was wrong. Read it as: <em>the model said yes, and it was wrong.</em></p>

        <h3>Accuracy, Precision, Recall &amp; F1</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>Metric</th><th>Formula</th><th>Question it answers</th></tr></thead>
          <tbody>
            <tr><td>Accuracy</td><td>(TP+TN) / Total</td><td>"How often is the model right overall?" - misleading when classes are imbalanced</td></tr>
            <tr><td>Precision</td><td>TP / (TP+FP)</td><td>"Of everything I called positive, how much actually was?" High precision = few false alarms</td></tr>
            <tr><td>Recall</td><td>TP / (TP+FN)</td><td>"Of everything actually positive, how much did I catch?" High recall = few missed cases</td></tr>
            <tr><td>F1 score</td><td>2 &times; (P &times; R) / (P + R)</td><td>Combines precision and recall via harmonic mean - punishes the score hard if either one is low</td></tr>
          </tbody>
        </table></div>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>Why accuracy alone can lie:</strong> if 1 in 1000 transactions is fraud, a model that predicts "not fraud" for everything is 99.9% accurate - and catches zero fraud. Accuracy looks great while the model is completely useless. This is why precision, recall, and F1 matter for imbalanced problems like fraud detection or disease screening.</div></div>
        <p><em>Worked example:</em> 100 patients screened, 20 actually have the condition, the test flags 25 as positive with 18 correct. TP=18, FP=25&minus;18=7, FN=20&minus;18=2. Precision = 18/25 = 0.72, Recall = 18/20 = 0.90, F1 = 2&times;(0.72&times;0.90)/(0.72+0.90) &asymp; <strong>0.80</strong>.</p>

        <h3>Data Cleaning &amp; the Train/Test Split</h3>
        <p>"Garbage in, garbage out" - a model can only be as good as the data it learns from. Common cleanup work: dropping or imputing missing values, removing duplicate rows, investigating outliers, standardizing inconsistent formatting, and encoding categorical data as numbers since most algorithms only accept numeric input.</p>
        <p>Evaluating a model on the same data it trained on measures whether it <em>memorized</em>, not whether it <em>learned</em>. The fix is holding back a portion of the data (typically ~20%) that the model never sees during training, then testing on that held-out set at the end. Many projects add a third validation set, carved from the training data, for tuning settings during development - keeping the test set completely untouched until the final, honest check.</p>

        <h3>Overfitting &amp; Underfitting</h3>
        <p>These describe the two ways a model can fail to generalize - and the train/test split above is exactly the tool that reveals them, since neither problem is visible from training performance alone.</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th></th><th>Training accuracy</th><th>Test accuracy</th><th>What's happening</th></tr></thead>
          <tbody>
            <tr><td>Underfitting</td><td>Low</td><td>Low</td><td>The model is too simple to capture the real pattern - it does poorly even on data it has already seen</td></tr>
            <tr><td>Good fit</td><td>High</td><td>High, close to training</td><td>The model learned the underlying pattern and generalizes well to new data</td></tr>
            <tr><td>Overfitting</td><td>Very high</td><td>Low</td><td>The model memorized the training data - including its noise - instead of learning the general pattern</td></tr>
          </tbody>
        </table></div>

        <div class="report-diagram">
          <svg viewBox="0 0 380 115" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor">
            <g transform="translate(0,0)">
              <path d="M5,50 L105,50" stroke-width="1.6" stroke-opacity="0.85"/>
              <g fill="currentColor" stroke="none" fill-opacity="0.8">
                <circle cx="10" cy="70" r="2.6"/><circle cx="25" cy="50" r="2.6"/><circle cx="40" cy="35" r="2.6"/><circle cx="55" cy="30" r="2.6"/><circle cx="70" cy="35" r="2.6"/><circle cx="85" cy="50" r="2.6"/><circle cx="100" cy="70" r="2.6"/>
              </g>
              <text x="55" y="98" text-anchor="middle" font-size="9" font-weight="700" stroke="none" fill="currentColor">Underfit</text>
              <text x="55" y="110" text-anchor="middle" font-size="7" stroke="none" fill="currentColor" opacity="0.6">too simple - misses the pattern</text>
            </g>
            <g transform="translate(135,0)">
              <path d="M5,68 C30,22 80,22 105,68" stroke-width="1.6" stroke-opacity="0.85"/>
              <g fill="currentColor" stroke="none" fill-opacity="0.8">
                <circle cx="10" cy="70" r="2.6"/><circle cx="25" cy="50" r="2.6"/><circle cx="40" cy="35" r="2.6"/><circle cx="55" cy="30" r="2.6"/><circle cx="70" cy="35" r="2.6"/><circle cx="85" cy="50" r="2.6"/><circle cx="100" cy="70" r="2.6"/>
              </g>
              <text x="55" y="98" text-anchor="middle" font-size="9" font-weight="700" stroke="none" fill="currentColor">Good Fit</text>
              <text x="55" y="110" text-anchor="middle" font-size="7" stroke="none" fill="currentColor" opacity="0.6">follows the real trend</text>
            </g>
            <g transform="translate(270,0)">
              <path d="M10,70 L17,58 L25,50 L32,18 L40,35 L47,14 L55,30 L63,14 L70,35 L78,56 L85,50 L92,64 L100,70" stroke-width="1.6" stroke-opacity="0.85"/>
              <g fill="currentColor" stroke="none" fill-opacity="0.8">
                <circle cx="10" cy="70" r="2.6"/><circle cx="25" cy="50" r="2.6"/><circle cx="40" cy="35" r="2.6"/><circle cx="55" cy="30" r="2.6"/><circle cx="70" cy="35" r="2.6"/><circle cx="85" cy="50" r="2.6"/><circle cx="100" cy="70" r="2.6"/>
              </g>
              <text x="55" y="98" text-anchor="middle" font-size="9" font-weight="700" stroke="none" fill="currentColor">Overfit</text>
              <text x="55" y="110" text-anchor="middle" font-size="7" stroke="none" fill="currentColor" opacity="0.6">chases every wiggle, incl. noise</text>
            </g>
          </svg>
          <figcaption>Same data, three fit lines. Underfit ignores the real dip in the data; the good fit smooths through it; overfit zigzags to hit every point exactly, including noise that won't repeat on new data.</figcaption>
        </div>

        <p><em>Example:</em> a model scores 98% accuracy on training but only 61% on test - that gap is overfitting, not underfitting. Fixes: get more training data, simplify the model, add regularization, use early stopping, or cross-validation. Underfitting instead calls for the opposite: a more complex model, better features, or more training time.</p>

        <h3>Where to Go Next</h3>
        <p>From these fundamentals, the natural next step is actually building one of these architectures hands-on - training a small CNN on an image dataset, fine-tuning a pretrained model (transfer learning) rather than starting from scratch, or working through the math of backpropagation by hand on a tiny network to see gradient descent update real numbers. See the <a href="report.html?id=opencv">Computer Vision with OpenCV</a> report for where the CNN/YOLO side of this leads in practice.</p>
      `,
    },
    th: {
      eyebrow: "ม.5 · งานในชั้นเรียน",
      date: "เทอม 1",
      title: "Deep Learning: จาก AI สู่ LLM",
      meta: "AI vs ML vs DL, กายวิภาคของ neural network, CNN/RNN/Transformer/LLM และวิธีที่ training, epoch, F1 และ overfitting ทำงานจริง",
      body: `
        <p>แนวทางเข้าใจศัพท์และคณิตศาสตร์เบื้องหลังทุกบทสนทนาเรื่อง AI - AI, ML และ Deep Learning หมายถึงอะไรจริง ๆ ในฐานะแนวคิดที่ซ้อนกัน, neural network สร้างจาก weight อย่างไร และเกิดอะไรขึ้นจริง ๆ เมื่อโมเดล "เทรน 10 epoch" หรือได้คะแนน "F1 เท่ากับ 0.8"</p>

        <h3>AI เทียบกับ Machine Learning เทียบกับ Deep Learning</h3>
        <p>สามคำนี้ถูกใช้แทนกันแทบทุกครั้ง แต่จริง ๆ แล้วมันอธิบายแนวคิดที่ซ้อนกันและเจาะจงขึ้นเรื่อย ๆ - ไม่ใช่สามสิ่งที่ต่างกัน</p>
        <div class="report-diagram">
          <svg viewBox="0 0 220 230" xmlns="http://www.w3.org/2000/svg">
            <circle cx="110" cy="120" r="100" fill="currentColor" fill-opacity="0.05" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.3"/>
            <circle cx="110" cy="120" r="68" fill="currentColor" fill-opacity="0.09" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.3"/>
            <circle cx="110" cy="120" r="36" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.3"/>
            <text x="110" y="44" text-anchor="middle" font-size="11" font-weight="700" stroke="none" fill="currentColor">AI</text>
            <text x="110" y="74" text-anchor="middle" font-size="10.5" font-weight="700" stroke="none" fill="currentColor" opacity="0.85">ML</text>
            <text x="110" y="123" text-anchor="middle" font-size="10.5" font-weight="700" stroke="none" fill="currentColor">DL</text>
          </svg>
          <figcaption>แต่ละวงอยู่ในวงก่อนหน้าทั้งหมด - ทุกระบบ Deep Learning คือ Machine Learning และทุกระบบ Machine Learning คือ AI แต่ไม่ใช่ในทางกลับกัน</figcaption>
        </div>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>คำ</th><th>นิยาม</th><th>ตัวอย่าง</th></tr></thead>
          <tbody>
            <tr><td>Artificial Intelligence</td><td>เทคนิคใดก็ตามที่ทำให้คอมพิวเตอร์ทำงาน "อย่างฉลาด" - รวมถึงกฎที่เขียนด้วยมือธรรมดา ไม่ต้องมีการเรียนรู้เลยก็ได้</td><td>เครื่องเล่นหมากรุกที่มีกฎ hard-coded</td></tr>
            <tr><td>Machine Learning</td><td>ส่วนย่อยของ AI ที่ระบบเรียนรู้กฎของตัวเองจากข้อมูล แทนที่จะให้มนุษย์เขียนด้วยมือ</td><td>ตัวกรองสแปมที่เทรนจากอีเมลที่ติด label</td></tr>
            <tr><td>Deep Learning</td><td>ส่วนย่อยของ ML ที่ใช้ neural network หลายชั้น ("deep") เพื่อเรียนรู้แพทเทิร์นที่ซับซ้อนมาก</td><td>การรู้จำภาพ, โมเดลสไตล์ ChatGPT</td></tr>
          </tbody>
        </table></div>
        <p>เครื่องเล่นหมากรุกที่ค้นหาการเดินหลายล้านแบบด้วยกฎที่เขียนด้วยมือคือ AI แต่ไม่ใช่ machine learning - มันไม่เคยเทรนจากข้อมูลหรือพัฒนาจากประสบการณ์เลย จุดเด่นเฉพาะของ ML คือพฤติกรรมมาจากข้อมูล ไม่ใช่โปรแกรมเมอร์ที่เขียนทุกกฎด้วยมือ</p>

        <h3>Neural Network: Weight, Bias และ Layer</h3>
        <p>Neural network สร้างจากชั้นของหน่วยง่าย ๆ ("นิวรอน") ทุกการเชื่อมต่อระหว่างนิวรอนมี <strong>weight</strong> - ตัวเลขที่บอกว่า input นั้นควรมีอิทธิพลต่อนิวรอนถัดไปมากแค่ไหน การเทรนโมเดลจริง ๆ แล้วก็คือกระบวนการหาค่าที่ดีสำหรับทุก weight ในเครือข่าย</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>คำ</th><th>คืออะไร</th></tr></thead>
          <tbody>
            <tr><td>Neuron</td><td>หน่วยง่าย ๆ ที่รับ input มารวมกัน แล้วส่งผลลัพธ์ต่อไป</td></tr>
            <tr><td>Weight</td><td>ตัวเลขบนแต่ละการเชื่อมต่อที่ควบคุมว่า input นั้นสำคัญแค่ไหน - ค่ามากยิ่งมีอิทธิพลมาก</td></tr>
            <tr><td>Bias</td><td>ตัวเลขปรับได้เพิ่มเติมที่บวกเข้าไปใน output ของนิวรอน ไม่ขึ้นกับ input ใด ๆ - เลื่อนผลลัพธ์ขึ้นหรือลง</td></tr>
            <tr><td>Parameters</td><td>weight และ bias ทั้งหมดในโมเดลรวมกัน - โมเดลที่มี "175 พันล้านพารามิเตอร์" ก็มีตัวเลขที่เรียนรู้ได้เยอะขนาดนั้น</td></tr>
            <tr><td>Layer</td><td>กลุ่มนิวรอนที่ประมวลผลร่วมกัน - input layer, hidden layer หนึ่งชั้นขึ้นไป, output layer</td></tr>
            <tr><td>Activation function</td><td>ฟังก์ชันเล็ก ๆ (เช่น ReLU) ที่ใช้กับ output ของนิวรอน ทำให้เครือข่ายเรียนรู้แพทเทิร์นแบบไม่เชิงเส้นที่ซับซ้อนขึ้นได้</td></tr>
          </tbody>
        </table></div>
        <p>ถ้าไม่มี activation function การซ้อน layer จะไม่มีความหมายเลย - ห่วงโซ่ของผลรวมถ่วงน้ำหนักธรรมดาจะยุบทางคณิตศาสตร์กลายเป็นผลรวมถ่วงน้ำหนักเดียวไม่ว่าจะเพิ่มกี่ layer ก็ตาม activation function คือสิ่งที่ทำให้แต่ละ layer เรียนรู้อะไรใหม่จริง ๆ จาก layer ก่อนหน้าได้</p>

        <h3>Activation Function: ReLU, Sigmoid และ Tanh</h3>
        <div class="report-diagram">
          <svg viewBox="0 0 380 100" xmlns="http://www.w3.org/2000/svg" font-size="8" fill="none" stroke="currentColor">
            <g transform="translate(0,0)">
              <line x1="5" y1="50" x2="105" y2="50" stroke-width="1" stroke-opacity="0.25"/>
              <line x1="55" y1="8" x2="55" y2="88" stroke-width="1" stroke-opacity="0.25"/>
              <path d="M10,50 L55,50 L100,12" stroke-width="1.8" stroke-opacity="0.9"/>
              <text x="55" y="98" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">ReLU</text>
            </g>
            <g transform="translate(135,0)">
              <line x1="5" y1="50" x2="105" y2="50" stroke-width="1" stroke-opacity="0.25"/>
              <line x1="55" y1="8" x2="55" y2="88" stroke-width="1" stroke-opacity="0.25"/>
              <path d="M10,82 C35,82 48,82 55,50 C62,18 75,18 100,18" stroke-width="1.8" stroke-opacity="0.9"/>
              <text x="55" y="98" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">Sigmoid</text>
            </g>
            <g transform="translate(270,0)">
              <line x1="5" y1="50" x2="105" y2="50" stroke-width="1" stroke-opacity="0.25"/>
              <line x1="55" y1="8" x2="55" y2="88" stroke-width="1" stroke-opacity="0.25"/>
              <path d="M10,84 C35,84 48,84 55,50 C62,16 75,16 100,16" stroke-width="1.8" stroke-opacity="0.9"/>
              <text x="55" y="98" text-anchor="middle" font-weight="700" stroke="none" fill="currentColor">Tanh</text>
            </g>
          </svg>
          <figcaption>ReLU: ราบที่ 0 แล้วไต่ขึ้นเป็นเส้นตรง Sigmoid: บีบทุกอย่างให้อยู่ในช่วง 0 ถึง 1 Tanh: รูปตัว S เหมือนกันแต่อยู่กึ่งกลางที่ 0 มีช่วง -1 ถึง 1</figcaption>
        </div>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ฟังก์ชัน</th><th>รูปร่าง</th><th>ใช้ทั่วไปกับ</th></tr></thead>
          <tbody>
            <tr><td>ReLU - <code>max(0, x)</code></td><td>0 สำหรับ input ติดลบ ไต่เป็นเส้นตรงหลังจากนั้น</td><td>ค่าเริ่มต้นสำหรับ hidden layer - คำนวณเร็ว หลีกเลี่ยงปัญหา "vanishing gradient"</td></tr>
            <tr><td>Sigmoid - <code>1/(1+e&#8315;&#775;)</code></td><td>รูปตัว S บีบ input ใด ๆ ให้อยู่ใน (0, 1)</td><td>Output layer ของ binary classifier - ผลลัพธ์อ่านเป็นความน่าจะเป็นได้ตรง ๆ</td></tr>
            <tr><td>Tanh</td><td>รูปตัว S บีบ input ใด ๆ ให้อยู่ใน (-1, 1)</td><td>คล้าย sigmoid แต่ zero-centered - เคยพบบ่อยใน hidden layer รุ่นเก่า ตอนนี้ถูกแทนที่ด้วย ReLU เป็นส่วนใหญ่</td></tr>
            <tr><td>Softmax</td><td>เปลี่ยนตัวเลขทั้ง layer ให้เป็น probability distribution ที่รวมกันได้ 1</td><td>Output layer ของ multi-class classifier - เลือกหนึ่งคลาสจากหลายคลาส</td></tr>
          </tbody>
        </table></div>
        <div class="report-warn"><i class="bi bi-lightbulb"></i><div><strong>สิ่งที่มือใหม่ควรจำจริง ๆ:</strong> สำหรับ hidden layer ใช้ ReLU เป็นค่าเริ่มต้นแล้วไม่ต้องคิดมาก - มันคือตัวเลือกมาตรฐานเกือบทุกที่ activation ที่ต้องเลือกให้ถูกจริง ๆ คือ layer <em>output</em> และมันถูกเลือกให้ตรงกับงาน ไม่ใช่เลือกตามใจ: sigmoid สำหรับคำถามใช่/ไม่ใช่, softmax เมื่อต้องเลือกหนึ่งคลาสจากหลายคลาส และมักไม่มี activation เลย (แค่ตัวเลขดิบ) เมื่อทำนายค่าต่อเนื่องอย่างราคาหรือระยะทาง</div></div>

        <h3>Training ทำงานจริงอย่างไร</h3>
        <p>Training คือลูปที่ทำซ้ำเป็นพัน ๆ ครั้ง ค่อย ๆ ขยับทุก weight ให้เข้าใกล้ "ถูกต้อง" ทีละนิด</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ขั้นตอน</th><th>สิ่งที่เกิดขึ้น</th></tr></thead>
          <tbody>
            <tr><td>1. Forward pass</td><td>ป้อนข้อมูล input ผ่านเครือข่ายด้วย weight ปัจจุบันเพื่อได้การทำนาย</td></tr>
            <tr><td>2. Loss</td><td>เทียบการทำนายกับคำตอบที่ถูกต้องด้วย loss function - ตัวเลขเดียวที่สูงเมื่อผิด ต่ำเมื่อถูก</td></tr>
            <tr><td>3. Backpropagation</td><td>ไล่ย้อนกลับผ่านเครือข่าย คำนวณว่าแต่ละ weight มีส่วนทำให้เกิด error มากแค่ไหน</td></tr>
            <tr><td>4. Gradient descent</td><td>ขยับทุก weight เล็กน้อยไปในทิศทางที่ลด loss ปรับสเกลด้วย learning rate</td></tr>
          </tbody>
        </table></div>
        <p><strong>Learning rate</strong> คือขนาดของแต่ละก้าว: สูงเกินไปการเทรนจะแกว่งเลยจุดที่ต้องการและไม่มีวันนิ่ง ต่ำเกินไปการเทรนจะคืบไปทีละนิดและใช้เวลานานมาก</p>

        <h3>Epoch, Batch Size และ Iteration</h3>
        <p>โมเดลแทบไม่เคยเทรนบน dataset ทั้งหมดในก้าวเดียว - มันถูกแบ่งเป็นก้อน ๆ และสามคำนี้อธิบายว่าการแบ่งนั้นทำงานอย่างไรพอดี</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>คำ</th><th>ความหมาย</th></tr></thead>
          <tbody>
            <tr><td>Batch size</td><td>จำนวนตัวอย่างที่ประมวลผลร่วมกันก่อนที่ weight จะอัปเดตหนึ่งครั้ง (เช่น 32)</td></tr>
            <tr><td>Iteration</td><td>การอัปเดต weight หนึ่งครั้ง - ประมวลผลหนึ่ง batch พอดี</td></tr>
            <tr><td>Epoch</td><td>การผ่าน training set ทั้งชุดครบหนึ่งรอบ - ประกอบด้วยหลาย iteration</td></tr>
          </tbody>
        </table></div>
        <p><em>ตัวอย่างการคำนวณ:</em> training set มี 1,000 ตัวอย่าง batch size คือ 50 iteration ต่อ epoch = 1000 / 50 = <strong>20</strong> โมเดลอัปเดต weight 20 ครั้งเพื่อผ่านหนึ่งรอบเต็ม และการเทรน "10 epoch" หมายถึงการทำรอบ 20 iteration นั้นซ้ำ 10 รอบ Batch เล็กกว่า (8-32) เร็วกว่าต่อก้าวและใช้หน่วยความจำน้อยกว่าแต่ต้องใช้ iteration รวมมากกว่า Batch ใหญ่กว่า (512+) ให้การอัปเดตที่เสถียรกว่าแต่ต้องใช้หน่วยความจำมากกว่าและอาจ generalize ได้แย่กว่าเล็กน้อย</p>

        <h3>สถาปัตยกรรม: MLP, CNN, RNN, Transformer และ LLM</h3>
        <p>รูปร่างพื้นฐานด้านบน - ทุกนิวรอนเชื่อมกับทุกนิวรอนใน layer ถัดไป - เรียกว่า <strong>MLP</strong> (Multi-Layer Perceptron) มันใช้ได้กับปัญหาง่าย ๆ แต่วงการนี้พัฒนาตัวแปรเฉพาะทางขึ้นมาเมื่อคนเริ่มแก้ปัญหาที่ยากขึ้นอย่างภาพ ภาษา และลำดับยาว ๆ</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>สถาปัตยกรรม</th><th>สร้างมาสำหรับ</th><th>ตัวอย่างการใช้งานจริง</th></tr></thead>
          <tbody>
            <tr><td>MLP</td><td>ใช้งานทั่วไป, layer เชื่อมต่อเต็มรูปแบบ - ใช้ได้กับ input แบบตารางที่ขนาดคงที่และเรียบง่าย</td></tr>
            <tr><td>CNN (Convolutional Neural Network)</td><td>สแกน filter เล็ก ๆ ไปทั่วข้อมูลแบบตาราง (grid) เพื่อจับแพทเทิร์นเฉพาะที่ (ขอบ, รูปทรง, พื้นผิว) - เป็นแกนหลักของ computer vision</td><td>ตรวจจับใบหน้า, จำแนกภาพ</td></tr>
            <tr><td>RNN (Recurrent Neural Network)</td><td>ประมวลผลลำดับทีละขั้น โดยป้อน output ก่อนหน้าของตัวเองกลับเข้าไปเป็น "ความจำ" ของสิ่งที่ผ่านมา</td><td>การรู้จำเสียงพูดรุ่นเก่า, การทำนาย time-series แบบง่าย</td></tr>
            <tr><td>Transformer</td><td>ใช้กลไก attention เพื่อชั่งน้ำหนักว่าทุกส่วนของ input เกี่ยวข้องกับทุกส่วนอื่นแค่ไหน พร้อมกันทั้งหมด - เทรนแบบขนานได้เร็วกว่า RNN มาก</td><td>Google Translate, โมเดลเสียงและภาษาสมัยใหม่</td></tr>
            <tr><td>LLM (Large Language Model)</td><td>Transformer ที่เทรนบนข้อความจำนวนมหาศาล มีจำนวนพารามิเตอร์ระดับพันล้าน - ใหญ่พอที่จะ generalize ไปสู่บทสนทนาแบบเปิดกว้างได้</td><td>ChatGPT, Claude, Gemini</td></tr>
          </tbody>
        </table></div>
        <p>Computer vision ไม่ใช่ AI คนละประเภท - มันคืองาน (ทำให้คอมพิวเตอร์ตีความภาพได้) และ CNN ก็แค่เป็นสถาปัตยกรรมที่เหมาะกับงานนั้นที่สุด เช่นเดียวกับที่ Transformer เหมาะกับภาษาที่สุด และ computer vision แบบ "คลาสสิก" ที่ออกแบบ feature ด้วยมือก่อน (edge detection, color histogram) แล้วป้อนเข้า classifier มาตรฐาน ก็ยังเป็น ML พื้นฐานที่สวมหมวก computer vision อยู่ดี - เวอร์ชัน deep learning หมายถึงโมเดลเรียนรู้ feature ของตัวเองจาก pixel ดิบโดยตรง ไม่มีขั้นตอน feature-engineering ด้วยมือเลย</p>

        <h3>ไม่ใช่ทุกอย่างจะเป็น Neural Network: Decision Tree</h3>
        <p>ก่อนจะหยิบ deep learning มาใช้ ปัญหาจริงหลายอย่างแก้ได้ดีกว่าและเร็วกว่าด้วยโมเดลที่ง่ายกว่ามาก - <strong>decision tree</strong> คือตัวอย่างที่ชัดที่สุด แทนที่จะเป็นชั้นของ weight มันคือ flowchart ของคำถามใช่/ไม่ใช่ที่เรียนรู้จากข้อมูล: ที่แต่ละ node มันเลือก feature และ threshold ตัวเดียวที่แบ่งข้อมูลออกเป็นกลุ่มที่ "บริสุทธิ์" ที่สุด แล้วทำซ้ำในแต่ละกิ่งที่ได้ จนใบไม้ส่วนใหญ่เหลือคลาสเดียว</p>
        <div class="report-diagram">
          <svg viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg" font-size="8.5" fill="none" stroke="currentColor">
            <rect x="90" y="6" width="80" height="26" rx="5" stroke-width="1.2" stroke-opacity="0.85"/>
            <text x="130" y="23" text-anchor="middle" stroke="none" fill="currentColor">อายุ &lt; 30?</text>
            <line x1="110" y1="32" x2="60" y2="58" stroke-width="1.2" stroke-opacity="0.7"/>
            <text x="72" y="48" stroke="none" fill="currentColor" opacity="0.65">ใช่</text>
            <line x1="150" y1="32" x2="200" y2="58" stroke-width="1.2" stroke-opacity="0.7"/>
            <text x="178" y="48" stroke="none" fill="currentColor" opacity="0.65">ไม่ใช่</text>
            <rect x="20" y="58" width="80" height="26" rx="5" stroke-width="1.2" stroke-opacity="0.85"/>
            <text x="60" y="75" text-anchor="middle" stroke="none" fill="currentColor">รายได้ &lt; 20k?</text>
            <rect x="160" y="58" width="80" height="26" rx="5" stroke-width="1.2" stroke-opacity="0.85"/>
            <text x="200" y="75" text-anchor="middle" stroke="none" fill="currentColor">เครดิต &gt; 700?</text>
            <line x1="40" y1="84" x2="25" y2="110" stroke-width="1.2" stroke-opacity="0.6"/>
            <line x1="80" y1="84" x2="95" y2="110" stroke-width="1.2" stroke-opacity="0.6"/>
            <line x1="180" y1="84" x2="165" y2="110" stroke-width="1.2" stroke-opacity="0.6"/>
            <line x1="220" y1="84" x2="235" y2="110" stroke-width="1.2" stroke-opacity="0.6"/>
            <rect x="2" y="110" width="46" height="24" rx="5" fill="currentColor" fill-opacity="0.15" stroke-width="1.2"/>
            <text x="25" y="126" text-anchor="middle" stroke="none" fill="currentColor" font-weight="700">ปฏิเสธ</text>
            <rect x="72" y="110" width="46" height="24" rx="5" fill="currentColor" fill-opacity="0.15" stroke-width="1.2"/>
            <text x="95" y="126" text-anchor="middle" stroke="none" fill="currentColor" font-weight="700">อนุมัติ</text>
            <rect x="142" y="110" width="46" height="24" rx="5" fill="currentColor" fill-opacity="0.15" stroke-width="1.2"/>
            <text x="165" y="126" text-anchor="middle" stroke="none" fill="currentColor" font-weight="700">อนุมัติ</text>
            <rect x="212" y="110" width="46" height="24" rx="5" fill="currentColor" fill-opacity="0.15" stroke-width="1.2"/>
            <text x="235" y="126" text-anchor="middle" stroke="none" fill="currentColor" font-weight="700">ปฏิเสธ</text>
          </svg>
          <figcaption>Decision tree สำหรับอนุมัติเงินกู้ - แต่ละ internal node คือการแบ่งใช่/ไม่ใช่ที่เรียนรู้จากข้อมูล แต่ละใบคือคำทำนายสุดท้าย ทั้ง "โมเดล" ก็คือ flowchart นี้เอง</figcaption>
        </div>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th></th><th>Decision tree</th><th>Neural network</th></tr></thead>
          <tbody>
            <tr><td>วิธีตัดสินใจ</td><td>ลำดับ if/else ที่เรียนรู้แล้วบนแต่ละ feature</td><td>ผลรวมถ่วงน้ำหนักที่ผ่าน activation function ข้ามหลาย layer</td></tr>
            <tr><td>ความอธิบายได้</td><td>สูง - เหตุผลที่แน่ชัดของการทำนายใด ๆ อ่านออกมาเป็น path ลงต้นไม้ได้เลย</td><td>ต่ำ - เป็น "black box" อธิบายยากว่าทำไมการทำนายนั้นถึงออกมาแบบนั้น</td></tr>
            <tr><td>ความต้องการข้อมูล</td><td>ใช้ได้ดีกับ dataset แบบตารางขนาดเล็ก</td><td>มักต้องการข้อมูลมากกว่ามากถึงจะเทรนได้ดี โดยเฉพาะ CNN/Transformer</td></tr>
            <tr><td>จุดอ่อน</td><td>ต้นไม้ลึกตัวเดียว overfit ได้ง่าย - จำแถวข้อมูลเทรนแต่ละแถวเป็นกิ่งของตัวเอง</td><td>ก็ overfit ได้เช่นกัน แต่มีเครื่องมือ regularization อื่นให้ใช้ (dropout, data augmentation)</td></tr>
          </tbody>
        </table></div>
        <p>วิธีเลือกจุดแบ่ง: ที่แต่ละ node อัลกอริทึมจะลองทุก feature และ threshold แล้วเลือกจุดแบ่งที่ทำให้สองกลุ่มที่ได้ "บริสุทธิ์" ที่สุด - วัดด้วย <strong>Gini impurity</strong> หรือ <strong>entropy</strong> (ความปนกันของคลาสภายในกลุ่ม; 0 หมายถึงกลุ่มเป็นคลาสเดียวล้วน ๆ) ต้นไม้เดี่ยว overfit ได้ง่าย ซึ่งเป็นเหตุผลที่ในทางปฏิบัติ <strong>Random Forest</strong> - เทรนต้นไม้หลายต้นบนชุดข้อมูลและ feature แบบสุ่ม แล้วเฉลี่ยผลโหวต - เป็นตัวเลือกที่พบได้บ่อยกว่ามากในโลกจริง: ข้อผิดพลาดของต้นไม้แต่ละต้นมักหักล้างกัน ในขณะที่สัญญาณที่ถูกต้องร่วมกันจะเสริมกันแทน</p>

        <h3>การประเมินโมเดล: TP, FP, TN, FN</h3>
        <p>สำหรับ binary classifier (แยกเป็นหนึ่งในสองคลาส เช่น "สแปม" กับ "ไม่ใช่สแปม") ทุกการทำนายจะตกอยู่ในหนึ่งในสี่กลุ่มพอดี ขึ้นอยู่กับสิ่งที่ทำนายเทียบกับสิ่งที่เป็นจริง</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>คำ</th><th>ความหมาย</th><th>ตัวอย่างตัวกรองสแปม</th></tr></thead>
          <tbody>
            <tr><td>True Positive (TP)</td><td>ทำนายเป็นบวก จริง ๆ ก็เป็นบวก - "ใช่" ที่ถูกต้อง</td><td>สแปมที่ถูกตั้งค่าสถานะว่าเป็นสแปมอย่างถูกต้อง</td></tr>
            <tr><td>True Negative (TN)</td><td>ทำนายเป็นลบ จริง ๆ ก็เป็นลบ - "ไม่ใช่" ที่ถูกต้อง</td><td>อีเมลจริงที่ถูกปล่อยผ่านอย่างถูกต้อง</td></tr>
            <tr><td>False Positive (FP)</td><td>ทำนายเป็นบวก แต่จริง ๆ เป็นลบ - การเตือนที่ผิด</td><td>อีเมลจริงที่ถูกตั้งค่าสถานะว่าเป็นสแปมผิด ๆ</td></tr>
            <tr><td>False Negative (FN)</td><td>ทำนายเป็นลบ แต่จริง ๆ เป็นบวก - เคสที่พลาดไป</td><td>สแปมที่หลุดเข้า inbox</td></tr>
          </tbody>
        </table></div>
        <p>"False" อธิบายการทำนาย ไม่ใช่ความจริง - False Positive หมายถึงการทำนายเป็นบวกของโมเดลนั้นผิด อ่านมันแบบนี้: <em>โมเดลบอกว่าใช่ และมันผิด</em></p>

        <h3>Accuracy, Precision, Recall และ F1</h3>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th>ตัวชี้วัด</th><th>สูตร</th><th>คำถามที่มันตอบ</th></tr></thead>
          <tbody>
            <tr><td>Accuracy</td><td>(TP+TN) / Total</td><td>"โมเดลถูกต้องบ่อยแค่ไหนโดยรวม?" - ทำให้เข้าใจผิดได้เมื่อคลาสไม่สมดุลกัน</td></tr>
            <tr><td>Precision</td><td>TP / (TP+FP)</td><td>"จากทุกอย่างที่ฉันเรียกว่าบวก มันเป็นบวกจริงกี่เปอร์เซ็นต์?" Precision สูง = การเตือนผิดน้อย</td></tr>
            <tr><td>Recall</td><td>TP / (TP+FN)</td><td>"จากทุกอย่างที่เป็นบวกจริง ฉันจับได้กี่เปอร์เซ็นต์?" Recall สูง = พลาดน้อย</td></tr>
            <tr><td>F1 score</td><td>2 &times; (P &times; R) / (P + R)</td><td>รวม precision กับ recall ด้วย harmonic mean - ลงโทษคะแนนหนักถ้าตัวใดตัวหนึ่งต่ำ</td></tr>
          </tbody>
        </table></div>
        <div class="report-warn"><i class="bi bi-exclamation-triangle"></i><div><strong>ทำไม accuracy อย่างเดียวถึงหลอกได้:</strong> ถ้า 1 ใน 1000 ธุรกรรมเป็นการฉ้อโกง โมเดลที่ทำนาย "ไม่ฉ้อโกง" ทุกครั้งจะแม่นยำ 99.9% - และจับการฉ้อโกงได้ศูนย์เคส accuracy ดูดีมากในขณะที่โมเดลไร้ประโยชน์โดยสิ้นเชิง นี่คือเหตุผลที่ precision, recall และ F1 สำคัญสำหรับปัญหาที่คลาสไม่สมดุลอย่างการตรวจจับการฉ้อโกงหรือการคัดกรองโรค</div></div>
        <p><em>ตัวอย่างการคำนวณ:</em> คัดกรองผู้ป่วย 100 คน มี 20 คนที่ป่วยจริง การทดสอบตั้งค่าสถานะเป็นบวก 25 คน โดยถูก 18 คน TP=18, FP=25&minus;18=7, FN=20&minus;18=2 Precision = 18/25 = 0.72, Recall = 18/20 = 0.90, F1 = 2&times;(0.72&times;0.90)/(0.72+0.90) &asymp; <strong>0.80</strong></p>

        <h3>การทำความสะอาดข้อมูลและการแบ่ง Train/Test</h3>
        <p>"ใส่ขยะเข้าไป ก็ได้ขยะออกมา" - โมเดลจะดีได้แค่เท่าที่ข้อมูลที่มันเรียนรู้จากดีเท่านั้น งานทำความสะอาดที่พบบ่อย: ตัดหรือเติมค่าที่หายไป, ลบแถวที่ซ้ำกัน, ตรวจสอบค่าผิดปกติ, จัดฟอร์แมตที่ไม่สม่ำเสมอให้เป็นมาตรฐาน และเข้ารหัสข้อมูลเชิงหมวดหมู่เป็นตัวเลข เพราะอัลกอริทึมส่วนใหญ่รับแค่ input ที่เป็นตัวเลข</p>
        <p>การประเมินโมเดลด้วยข้อมูลชุดเดียวกับที่มันเทรนวัดได้แค่ว่ามัน <em>จำ</em> ได้หรือเปล่า ไม่ใช่ว่ามัน <em>เรียนรู้</em> หรือเปล่า วิธีแก้คือเก็บข้อมูลส่วนหนึ่งไว้ (ปกติราว ~20%) ที่โมเดลไม่เคยเห็นระหว่างเทรนเลย แล้วทดสอบกับชุดที่กันไว้นั้นตอนสุดท้าย หลายโปรเจกต์เพิ่ม validation set ชุดที่สาม แยกจาก training data สำหรับปรับตั้งค่าระหว่างการพัฒนา - เก็บ test set ไว้ไม่ให้ถูกแตะเลยจนกว่าจะถึงการตรวจสอบครั้งสุดท้ายที่ซื่อตรง</p>

        <h3>Overfitting และ Underfitting</h3>
        <p>สองคำนี้อธิบายสองวิธีที่โมเดลอาจล้มเหลวในการ generalize - และการแบ่ง train/test ด้านบนคือเครื่องมือที่เปิดเผยทั้งสองปัญหาพอดี เพราะทั้งคู่มองไม่เห็นจากประสิทธิภาพตอนเทรนเพียงอย่างเดียว</p>
        <div class="table-wrap"><table class="report-table">
          <thead><tr><th></th><th>Training accuracy</th><th>Test accuracy</th><th>เกิดอะไรขึ้น</th></tr></thead>
          <tbody>
            <tr><td>Underfitting</td><td>ต่ำ</td><td>ต่ำ</td><td>โมเดลง่ายเกินไปที่จะจับแพทเทิร์นจริง - มันทำได้แย่แม้กับข้อมูลที่เคยเห็นแล้ว</td></tr>
            <tr><td>Fit ที่ดี</td><td>สูง</td><td>สูง ใกล้เคียงกับตอนเทรน</td><td>โมเดลเรียนรู้แพทเทิร์นที่แท้จริงและ generalize ไปยังข้อมูลใหม่ได้ดี</td></tr>
            <tr><td>Overfitting</td><td>สูงมาก</td><td>ต่ำ</td><td>โมเดลจำข้อมูลเทรนไว้ - รวมถึง noise ของมันด้วย - แทนที่จะเรียนรู้แพทเทิร์นทั่วไป</td></tr>
          </tbody>
        </table></div>

        <div class="report-diagram">
          <svg viewBox="0 0 380 115" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor">
            <g transform="translate(0,0)">
              <path d="M5,50 L105,50" stroke-width="1.6" stroke-opacity="0.85"/>
              <g fill="currentColor" stroke="none" fill-opacity="0.8">
                <circle cx="10" cy="70" r="2.6"/><circle cx="25" cy="50" r="2.6"/><circle cx="40" cy="35" r="2.6"/><circle cx="55" cy="30" r="2.6"/><circle cx="70" cy="35" r="2.6"/><circle cx="85" cy="50" r="2.6"/><circle cx="100" cy="70" r="2.6"/>
              </g>
              <text x="55" y="98" text-anchor="middle" font-size="9" font-weight="700" stroke="none" fill="currentColor">Underfit</text>
              <text x="55" y="110" text-anchor="middle" font-size="7" stroke="none" fill="currentColor" opacity="0.6">ง่ายเกินไป - พลาดแพทเทิร์น</text>
            </g>
            <g transform="translate(135,0)">
              <path d="M5,68 C30,22 80,22 105,68" stroke-width="1.6" stroke-opacity="0.85"/>
              <g fill="currentColor" stroke="none" fill-opacity="0.8">
                <circle cx="10" cy="70" r="2.6"/><circle cx="25" cy="50" r="2.6"/><circle cx="40" cy="35" r="2.6"/><circle cx="55" cy="30" r="2.6"/><circle cx="70" cy="35" r="2.6"/><circle cx="85" cy="50" r="2.6"/><circle cx="100" cy="70" r="2.6"/>
              </g>
              <text x="55" y="98" text-anchor="middle" font-size="9" font-weight="700" stroke="none" fill="currentColor">Good Fit</text>
              <text x="55" y="110" text-anchor="middle" font-size="7" stroke="none" fill="currentColor" opacity="0.6">ตามเทรนด์จริง</text>
            </g>
            <g transform="translate(270,0)">
              <path d="M10,70 L17,58 L25,50 L32,18 L40,35 L47,14 L55,30 L63,14 L70,35 L78,56 L85,50 L92,64 L100,70" stroke-width="1.6" stroke-opacity="0.85"/>
              <g fill="currentColor" stroke="none" fill-opacity="0.8">
                <circle cx="10" cy="70" r="2.6"/><circle cx="25" cy="50" r="2.6"/><circle cx="40" cy="35" r="2.6"/><circle cx="55" cy="30" r="2.6"/><circle cx="70" cy="35" r="2.6"/><circle cx="85" cy="50" r="2.6"/><circle cx="100" cy="70" r="2.6"/>
              </g>
              <text x="55" y="98" text-anchor="middle" font-size="9" font-weight="700" stroke="none" fill="currentColor">Overfit</text>
              <text x="55" y="110" text-anchor="middle" font-size="7" stroke="none" fill="currentColor" opacity="0.6">ไล่ตามทุกจุด รวม noise</text>
            </g>
          </svg>
          <figcaption>ข้อมูลชุดเดียวกัน สามเส้น fit Underfit มองข้ามช่วงต่ำจริงของข้อมูล; fit ที่ดีลากผ่านมันอย่างเรียบ; overfit หักไปมาเพื่อโดนทุกจุดพอดี รวมถึง noise ที่จะไม่ซ้ำในข้อมูลใหม่</figcaption>
        </div>

        <p><em>ตัวอย่าง:</em> โมเดลได้ 98% accuracy ตอนเทรนแต่แค่ 61% ตอนทดสอบ - ช่องว่างนั้นคือ overfitting ไม่ใช่ underfitting วิธีแก้: หา training data เพิ่ม, ลดความซับซ้อนของโมเดล, เพิ่ม regularization, ใช้ early stopping หรือ cross-validation ส่วน underfitting ต้องแก้ตรงข้ามกัน: โมเดลที่ซับซ้อนขึ้น, feature ที่ดีขึ้น หรือเวลาเทรนมากขึ้น</p>

        <h3>ก้าวต่อไป</h3>
        <p>จากพื้นฐานเหล่านี้ ก้าวต่อไปตามธรรมชาติคือการลงมือสร้างสถาปัตยกรรมเหล่านี้จริง ๆ - เทรน CNN เล็ก ๆ บน image dataset, fine-tune โมเดลที่เทรนไว้ล่วงหน้า (transfer learning) แทนการเริ่มจากศูนย์ หรือไล่คณิตศาสตร์ของ backpropagation ด้วยมือบนเครือข่ายเล็ก ๆ เพื่อดู gradient descent อัปเดตตัวเลขจริง ดูรายงาน <a href="report.html?id=opencv">Computer Vision with OpenCV</a> สำหรับทิศทางที่ฝั่ง CNN/YOLO นำไปสู่ในทางปฏิบัติ</p>
      `,
    },
  },
};
