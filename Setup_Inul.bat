@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
:: Activate ANSI Colors to support advanced Hacker Green + Blue styling
reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1

:: Generate valid ESC character for ANSI Colors
for /F %%a in ('echo prompt $E^|cmd') do set "ESC=%%a"

title Setup Inul - Credit: ig@ikifer
color 0f

:: ANSI Code Colors Definitions
set "GREEN=%ESC%[92m"
set "BLUE=%ESC%[94m"
set "CYAN=%ESC%[96m"
set "WHITE=%ESC%[97m"
set "RED=%ESC%[91m"
set "MAGENTA=%ESC%[95m"
set "YELLOW=%ESC%[93m"
set "GRAY=%ESC%[90m"
set "RESET=%ESC%[0m"

:: Fetching Basic System Info
for /f "tokens=4-5 delims=[.] " %%i in ('ver') do set OS_VER=%%i.%%j
for /f "tokens=1-4 delims=/ " %%i in ('date /t') do set CUR_DATE=%%i/%%j/%%k

:MAINMENU
cls
echo %BLUE%====================================================================================================%RESET%
echo %BLUE%  ███████╗███████╗████████╗██╗   ██╗██████╗     ██╗███╗   ██╗██╗   ██╗██╗%RESET%
echo %BLUE%  ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗    ██║████╗  ██║██║   ██║██║%RESET%
echo %BLUE%  ███████╗█████╗     ██║   ██║   ██║██████╔╝    ██║██╔██╗ ██║██║   ██║██║%RESET%
echo %BLUE%  ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝     ██║██║╚██╗██║██║   ██║██║%RESET%
echo %BLUE%  ███████║███████╗   ██║   ╚██████╔╝██║         ██║██║ ╚████║╚██████╔╝███████╗%RESET%
echo %BLUE%  ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝         ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝%RESET%
echo %BLUE%====================================================================================================%RESET%
echo %WHITE%USER: %CYAN%%USERNAME%%WHITE%  ^|  COMPUTERNAME: %YELLOW%%COMPUTERNAME%%WHITE%  ^|  OS VER: %MAGENTA%%OS_VER%%WHITE%  ^|  DATE: %CYAN%%CUR_DATE%%RESET%
echo %YELLOW%FOLLOW US ON INSTAGRAM: IG@IKIFER  ^>  SETUP INUL POST-INSTALLER%RESET%
echo %GREEN%====================================================================================================%RESET%
echo.
echo %CYAN%╔══════════════════════════════════╗      ╔══════════════════════════════════╗%RESET%
echo %CYAN%║  BROWSER ^| DEV ^| OFFICE          ║      ║  UTILITIES ^| MEDIA ^| GAMING      ║%RESET%
echo %CYAN%╠══════════════════════════════════╣      ╠══════════════════════════════════╣%RESET%
echo %CYAN%║ %BLUE%[11]%CYAN% ^| %WHITE%Web Browsers              %CYAN%║      ║ %YELLOW%[21]%CYAN% ^| %WHITE%System Utilities          %CYAN%║%RESET%
echo %CYAN%║ %BLUE%[12]%CYAN% ^| %WHITE%IDE ^& Code Editors        %CYAN%║      ║ %YELLOW%[22]%CYAN% ^| %WHITE%Social ^& Chat Apps        %CYAN%║%RESET%
echo %CYAN%║ %BLUE%[13]%CYAN% ^| %WHITE%Developer Tools           %CYAN%║      ║ %YELLOW%[23]%CYAN% ^| %WHITE%Media Players ^& Audio     %CYAN%║%RESET%
echo %CYAN%║ %BLUE%[14]%CYAN% ^| %WHITE%Local Server ^& DB         %CYAN%║      ║ %YELLOW%[24]%CYAN% ^| %WHITE%Gaming Platforms          %CYAN%║%RESET%
echo %CYAN%║ %BLUE%[15]%CYAN% ^| %WHITE%Office ^& Design           %CYAN%║      ║ %WHITE%[31]%BLUE% ^| %WHITE%Drivers ^& Runtimes        %CYAN%║%RESET%
echo %CYAN%╚══════════════════════════════════╝      ╚══════════════════════════════════╝%RESET%
echo.
echo %GREEN%╔══════════════════════════════════╗      ╔══════════════════════════════════╗%RESET%
echo %GREEN%║  TWEAKS ^| CLEANER                ║      ║  SYSTEM TOOLS                    ║%RESET%
echo %GREEN%╠══════════════════════════════════╣      ╠══════════════════════════════════╣%RESET%
echo %GREEN%║ %WHITE%[41]%GREEN% ^| %WHITE%Bersihkan Cache ^& Temp    %GREEN%║      ║ %WHITE%[51]%GREEN% ^| %WHITE%System File Checker (SFC) %GREEN%║%RESET%
echo %GREEN%║ %WHITE%[42]%GREEN% ^| %WHITE%Aktifkan/Matikan Hibernasi%GREEN%║      ║ %WHITE%[52]%GREEN% ^| %WHITE%DISM - Perbaikan Windows  %GREEN%║%RESET%
echo %GREEN%║ %WHITE%[43]%GREEN% ^| %WHITE%Hapus Log Event Viewer    %GREEN%║      ║ %WHITE%[53]%GREEN% ^| %WHITE%Tambah User ^& Admin Baru  %GREEN%║%RESET%
echo %GREEN%║ %WHITE%[44]%GREEN% ^| %WHITE%Matikan Windows Update    %GREEN%║      ║ %WHITE%[54]%GREEN% ^| %WHITE%Info Sistem Lengkap       %GREEN%║%RESET%
echo %GREEN%║                                  ║      ║ %WHITE%[55]%GREEN% ^| %WHITE%Disk Cleanup (Pilih Drive)%GREEN%║%RESET%
echo %GREEN%╚══════════════════════════════════╝      ╚══════════════════════════════════╝%RESET%
echo.
echo %MAGENTA%╔════════════════════════════════════════════════════════════════════════════╗%RESET%
echo %MAGENTA%║ ALL IN ONE ^| AKTIVASI ^| EXIT                                               ║%RESET%
echo %MAGENTA%╠════════════════════════════════════════════════════════════════════════════╣%RESET%
echo %MAGENTA%║ %GREEN%[99]%MAGENTA% ^| %WHITE%INSTALL SEMUA                                                       %MAGENTA%║%RESET%
echo %MAGENTA%║ %YELLOW%[30]%MAGENTA% ^| %YELLOW%Aktivasi Windows                                                    %MAGENTA%║%RESET%
echo %MAGENTA%║ %RED%[00]%MAGENTA% ^| %RED%Exit Setup Inul                                                     %MAGENTA%║%RESET%
echo %MAGENTA%╚════════════════════════════════════════════════════════════════════════════╝%RESET%
echo.
echo %RED%╔════════════════════════════════════════════════════════════════════════════╗%RESET%
echo %RED%║ [!] DISCLAIMER                                                              ║%RESET%
echo %RED%╠════════════════════════════════════════════════════════════════════════════╣%RESET%
echo %RED%║ Semua software akan terinstall ke Drive C:\ secara default (winget).       ║%RESET%
echo %RED%║ Pastikan Drive C:\ memiliki ruang cukup sebelum instalasi.                 ║%RESET%
echo %RED%║ Koneksi internet stabil diperlukan. Jalankan sebagai Administrator.        ║%RESET%
echo %RED%╚════════════════════════════════════════════════════════════════════════════╝%RESET%
echo.
set /p choice="%WHITE%Type option: %RESET%"


if "%choice%"=="11" goto BROWSERS
if "%choice%"=="12" goto IDE
if "%choice%"=="13" goto DEVTOOLS
if "%choice%"=="14" goto DATABASE
if "%choice%"=="15" goto OFFICE
if "%choice%"=="21" goto UTILITIES
if "%choice%"=="22" goto SOSMED
if "%choice%"=="23" goto MEDIA
if "%choice%"=="24" goto GAMING
if "%choice%"=="41" goto CLEANER
if "%choice%"=="42" goto HIBERNASI
if "%choice%"=="43" goto EVENTLOG
if "%choice%"=="44" goto STOPWU
if "%choice%"=="51" goto SFC
if "%choice%"=="52" goto DISM
if "%choice%"=="53" goto ADDUSER
if "%choice%"=="54" goto SYSINFO
if "%choice%"=="55" goto DISKCLN
if "%choice%"=="99" goto ALL
if "%choice%"=="30" goto AKTIVASI
if "%choice%"=="31" goto DRIVERS
if "%choice%"=="00" goto EOF
if "%choice%"=="0" goto EOF

goto MAINMENU

:: ============================================================
::  HELPER: Fake loading animation before install
:: ============================================================
:ANIM
echo.
set "bar="
for /l %%i in (1,1,20) do (
    set "bar=!bar!█"
    <nul set /p "=  %CYAN%[!bar!%GRAY%]%RESET%  %WHITE%%ANIM_MSG%%RESET% "
    ping -n 1 127.0.0.1 >nul
    <nul set /p "=  "
    echo.
    if %%i lss 20 (
        <nul set /p "=  %CYAN%[!bar!%GRAY%]%RESET%  "
        cls
        echo %BLUE%====================================================================================================%RESET%
        echo %CYAN%  %ANIM_TITLE%%RESET%
        echo %BLUE%====================================================================================================%RESET%
    )
)
echo.
goto :eof

:: ============================================================
:BROWSERS
cls
echo %BLUE%╔══════════════════════════════════════════════════════╗%RESET%
echo %BLUE%║           🌐  WEB BROWSERS  - [11]                   ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %WHITE%[1/5]%BLUE% Google Chrome                                 ║%RESET%
echo %BLUE%║  %WHITE%[2/5]%BLUE% Brave Browser                                 ║%RESET%
echo %BLUE%║  %WHITE%[3/5]%BLUE% Mozilla Firefox                               ║%RESET%
echo %BLUE%║  %WHITE%[4/5]%BLUE% Opera                                         ║%RESET%
echo %BLUE%║  %WHITE%[5/5]%BLUE% Microsoft Edge                                ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %GREEN%Tekan ENTER untuk install semua%BLUE%                     ║%RESET%
echo %BLUE%║  %RED%Tekan 0 lalu ENTER untuk kembali%BLUE%                    ║%RESET%
echo %BLUE%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p br_confirm="%WHITE%Pilihan: %RESET%"
if "%br_confirm%"=="0" goto MAINMENU
cls
echo %BLUE%====================================================================================================%RESET%
echo %CYAN%  🌐 Installing Web Browsers%RESET%
echo %BLUE%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/5] Mengunduh ^& Menginstal Google Chrome...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Google.Chrome -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Google Chrome selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/5] Mengunduh ^& Menginstal Brave Browser...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Brave.Brave -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Brave Browser selesai!%RESET%
echo.
echo %CYAN%  ⏬ [3/5] Mengunduh ^& Menginstal Mozilla Firefox...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Mozilla.Firefox -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Mozilla Firefox selesai!%RESET%
echo.
echo %CYAN%  ⏬ [4/5] Mengunduh ^& Menginstal Opera...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Opera.Opera -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Opera selesai!%RESET%
echo.
echo %CYAN%  ⏬ [5/5] Mengunduh ^& Menginstal Microsoft Edge...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Microsoft.Edge -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Microsoft Edge selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua Web Browser berhasil diinstal!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:IDE
cls
echo %BLUE%╔══════════════════════════════════════════════════════╗%RESET%
echo %BLUE%║        💻  IDE ^& CODE EDITORS  - [12]                ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %WHITE%[1/6]%BLUE% Visual Studio Code                            ║%RESET%
echo %BLUE%║  %WHITE%[2/6]%BLUE% Cursor AI Editor                              ║%RESET%
echo %BLUE%║  %WHITE%[3/6]%BLUE% Apache NetBeans                               ║%RESET%
echo %BLUE%║  %WHITE%[4/6]%BLUE% IntelliJ IDEA Community                       ║%RESET%
echo %BLUE%║  %WHITE%[5/6]%BLUE% PyCharm Community                             ║%RESET%
echo %BLUE%║  %WHITE%[6/6]%BLUE% Sublime Text 4                                ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %GREEN%Tekan ENTER untuk install semua%BLUE%                     ║%RESET%
echo %BLUE%║  %RED%Tekan 0 lalu ENTER untuk kembali%BLUE%                    ║%RESET%
echo %BLUE%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p ide_confirm="%WHITE%Pilihan: %RESET%"
if "%ide_confirm%"=="0" goto MAINMENU
cls
echo %BLUE%====================================================================================================%RESET%
echo %CYAN%  💻 Installing IDE ^& Code Editors%RESET%
echo %BLUE%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/6] Mengunduh ^& Menginstal Visual Studio Code...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Microsoft.VisualStudioCode -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ VS Code selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/6] Mengunduh ^& Menginstal Cursor AI...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Anysphere.Cursor -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Cursor selesai!%RESET%
echo.
echo %CYAN%  ⏬ [3/6] Mengunduh ^& Menginstal Apache NetBeans...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Apache.NetBeans -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ NetBeans selesai!%RESET%
echo.
echo %CYAN%  ⏬ [4/6] Mengunduh ^& Menginstal IntelliJ IDEA...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id JetBrains.IntelliJIDEA.Community -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ IntelliJ IDEA selesai!%RESET%
echo.
echo %CYAN%  ⏬ [5/6] Mengunduh ^& Menginstal PyCharm Community...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id JetBrains.PyCharm.Community -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ PyCharm selesai!%RESET%
echo.
echo %CYAN%  ⏬ [6/6] Mengunduh ^& Menginstal Sublime Text 4...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id SublimeHQ.SublimeText.4 -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Sublime Text selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua IDE ^& Editor berhasil diinstal!%RESET%
echo %CYAN%  🤖 Tip: Gunakan Antigravity AI di Cursor / VS Code untuk coding lebih cepat!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:DEVTOOLS
cls
echo %BLUE%╔══════════════════════════════════════════════════════╗%RESET%
echo %BLUE%║        🛠️   DEVELOPER TOOLS  - [13]                   ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %WHITE%[1/6]%BLUE% Git Version Control                           ║%RESET%
echo %BLUE%║  %WHITE%[2/6]%BLUE% GitHub Desktop                                ║%RESET%
echo %BLUE%║  %WHITE%[3/6]%BLUE% Postman API Client                            ║%RESET%
echo %BLUE%║  %WHITE%[4/6]%BLUE% Oracle JDK 21                                 ║%RESET%
echo %BLUE%║  %WHITE%[5/6]%BLUE% Node.js LTS                                   ║%RESET%
echo %BLUE%║  %WHITE%[6/6]%BLUE% Python 3.12                                   ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %GREEN%Tekan ENTER untuk install semua%BLUE%                     ║%RESET%
echo %BLUE%║  %RED%Tekan 0 lalu ENTER untuk kembali%BLUE%                    ║%RESET%
echo %BLUE%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p dev_confirm="%WHITE%Pilihan: %RESET%"
if "%dev_confirm%"=="0" goto MAINMENU
cls
echo %BLUE%====================================================================================================%RESET%
echo %CYAN%  🛠️  Installing Developer Tools%RESET%
echo %BLUE%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/6] Mengunduh ^& Menginstal Git...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Git selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/6] Mengunduh ^& Menginstal GitHub Desktop...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id GitHub.GitHubDesktop -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ GitHub Desktop selesai!%RESET%
echo.
echo %CYAN%  ⏬ [3/6] Mengunduh ^& Menginstal Postman...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Postman.Postman -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Postman selesai!%RESET%
echo.
echo %CYAN%  ⏬ [4/6] Mengunduh ^& Menginstal Oracle JDK 21...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Oracle.JDK.21 -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ JDK 21 selesai!%RESET%
echo.
echo %CYAN%  ⏬ [5/6] Mengunduh ^& Menginstal Node.js LTS...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Node.js selesai!%RESET%
echo.
echo %CYAN%  ⏬ [6/6] Mengunduh ^& Menginstal Python 3.12...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Python.Python.3.12 -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Python 3.12 selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua Developer Tools berhasil diinstal!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:DATABASE
cls
echo %BLUE%╔══════════════════════════════════════════════════════╗%RESET%
echo %BLUE%║     🗄️   LOCAL SERVER ^& DATABASE  - [14]             ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %WHITE%[1/3]%BLUE% MySQL Workbench                               ║%RESET%
echo %BLUE%║  %WHITE%[2/3]%BLUE% XAMPP 8.2                                     ║%RESET%
echo %BLUE%║  %WHITE%[3/3]%BLUE% Laragon                                       ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %GREEN%Tekan ENTER untuk install semua%BLUE%                     ║%RESET%
echo %BLUE%║  %RED%Tekan 0 lalu ENTER untuk kembali%BLUE%                    ║%RESET%
echo %BLUE%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p db_confirm="%WHITE%Pilihan: %RESET%"
if "%db_confirm%"=="0" goto MAINMENU
cls
echo %BLUE%====================================================================================================%RESET%
echo %CYAN%  🗄️  Installing Local Server ^& Database%RESET%
echo %BLUE%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/3] Mengunduh ^& Menginstal MySQL Workbench...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Oracle.MySQLWorkbench -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ MySQL Workbench selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/3] Mengunduh ^& Menginstal XAMPP 8.2...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id ApacheFriends.Xampp.8.2 -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ XAMPP selesai!%RESET%
echo.
echo %CYAN%  ⏬ [3/3] Mengunduh ^& Menginstal Laragon...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id leokhoa.laragon -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Laragon selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua Local Server ^& DB berhasil diinstal!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:OFFICE
cls
echo %BLUE%╔══════════════════════════════════════════════════════╗%RESET%
echo %BLUE%║       📄  OFFICE ^& DESIGN  - [15]                    ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %WHITE%[1/4]%BLUE% Microsoft Office                              ║%RESET%
echo %BLUE%║  %WHITE%[2/4]%BLUE% WPS Office                                    ║%RESET%
echo %BLUE%║  %WHITE%[3/4]%BLUE% Canva Desktop                                 ║%RESET%
echo %BLUE%║  %WHITE%[4/4]%BLUE% Adobe Acrobat Reader 64-bit                   ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %GREEN%Tekan ENTER untuk install semua%BLUE%                     ║%RESET%
echo %BLUE%║  %RED%Tekan 0 lalu ENTER untuk kembali%BLUE%                    ║%RESET%
echo %BLUE%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p off_confirm="%WHITE%Pilihan: %RESET%"
if "%off_confirm%"=="0" goto MAINMENU
cls
echo %BLUE%====================================================================================================%RESET%
echo %CYAN%  📄 Installing Office ^& Design%RESET%
echo %BLUE%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/4] Mengunduh ^& Menginstal Microsoft Office...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Microsoft.Office -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Microsoft Office selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/4] Mengunduh ^& Menginstal WPS Office...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Kingsoft.WPSOffice -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ WPS Office selesai!%RESET%
echo.
echo %CYAN%  ⏬ [3/4] Mengunduh ^& Menginstal Canva...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Canva.Canva -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Canva selesai!%RESET%
echo.
echo %CYAN%  ⏬ [4/4] Mengunduh ^& Menginstal Adobe Acrobat Reader...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Adobe.Acrobat.Reader.64-bit -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Adobe Acrobat Reader selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua Office ^& Design berhasil diinstal!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:UTILITIES
cls
echo %YELLOW%╔══════════════════════════════════════════════════════╗%RESET%
echo %YELLOW%║       ⚙️   SYSTEM UTILITIES  - [21]                  ║%RESET%
echo %YELLOW%╠══════════════════════════════════════════════════════╣%RESET%
echo %YELLOW%║  %WHITE%[1/5]%YELLOW% WinRAR                                        ║%RESET%
echo %YELLOW%║  %WHITE%[2/5]%YELLOW% 7-Zip                                         ║%RESET%
echo %YELLOW%║  %WHITE%[3/5]%YELLOW% Microsoft PowerToys                           ║%RESET%
echo %YELLOW%║  %WHITE%[4/5]%YELLOW% Rufus (Bootable USB Creator)                  ║%RESET%
echo %YELLOW%║  %WHITE%[5/5]%YELLOW% Snappy Driver Installer (Update Driver)       ║%RESET%
echo %YELLOW%╠══════════════════════════════════════════════════════╣%RESET%
echo %YELLOW%║  %GREEN%Tekan ENTER untuk install semua%YELLOW%                     ║%RESET%
echo %YELLOW%║  %RED%Tekan 0 lalu ENTER untuk kembali%YELLOW%                    ║%RESET%
echo %YELLOW%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p ut_confirm="%WHITE%Pilihan: %RESET%"
if "%ut_confirm%"=="0" goto MAINMENU
cls
echo %YELLOW%====================================================================================================%RESET%
echo %CYAN%  ⚙️  Installing System Utilities%RESET%
echo %YELLOW%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/5] Mengunduh ^& Menginstal WinRAR...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id RARLab.WinRAR -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ WinRAR selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/5] Mengunduh ^& Menginstal 7-Zip...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id 7zip.7zip -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ 7-Zip selesai!%RESET%
echo.
echo %CYAN%  ⏬ [3/5] Mengunduh ^& Menginstal Microsoft PowerToys...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id Microsoft.PowerToys -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ PowerToys selesai!%RESET%
echo.
echo %CYAN%  ⏬ [4/5] Mengunduh ^& Menginstal Rufus...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id Rufus.Rufus -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Rufus selesai!%RESET%
echo.
echo %CYAN%  ⏬ [5/5] Mengunduh ^& Menginstal Snappy Driver Installer Origin...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id Snappy.SnappyDriverInstallerOrigin -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Snappy Driver Installer selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua System Utilities berhasil diinstal!%RESET%
echo %CYAN%  🔧 Tip: Buka Snappy Driver Installer untuk update semua driver PC kamu!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:SOSMED
cls
echo %YELLOW%╔══════════════════════════════════════════════════════╗%RESET%
echo %YELLOW%║      💬  SOCIAL ^& CHAT APPS  - [22]                  ║%RESET%
echo %YELLOW%╠══════════════════════════════════════════════════════╣%RESET%
echo %YELLOW%║  %WHITE%[1/7]%YELLOW% Discord                                       ║%RESET%
echo %YELLOW%║  %WHITE%[2/7]%YELLOW% WhatsApp                                      ║%RESET%
echo %YELLOW%║  %WHITE%[3/7]%YELLOW% Telegram Desktop                              ║%RESET%
echo %YELLOW%║  %WHITE%[4/7]%YELLOW% Zoom                                          ║%RESET%
echo %YELLOW%║  %WHITE%[5/7]%YELLOW% Instagram (Microsoft Store)                   ║%RESET%
echo %YELLOW%║  %WHITE%[6/7]%YELLOW% Facebook (Microsoft Store)                    ║%RESET%
echo %YELLOW%║  %WHITE%[7/7]%YELLOW% TikTok (Microsoft Store)                      ║%RESET%
echo %YELLOW%╠══════════════════════════════════════════════════════╣%RESET%
echo %YELLOW%║  %GREEN%Tekan ENTER untuk install semua%YELLOW%                     ║%RESET%
echo %YELLOW%║  %RED%Tekan 0 lalu ENTER untuk kembali%YELLOW%                    ║%RESET%
echo %YELLOW%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p sm_confirm="%WHITE%Pilihan: %RESET%"
if "%sm_confirm%"=="0" goto MAINMENU
cls
echo %YELLOW%====================================================================================================%RESET%
echo %CYAN%  💬 Installing Social ^& Chat Apps%RESET%
echo %YELLOW%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/7] Mengunduh ^& Menginstal Discord...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id Discord.Discord -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Discord selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/7] Mengunduh ^& Menginstal WhatsApp...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id WhatsApp.WhatsApp -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ WhatsApp selesai!%RESET%
echo.
echo %CYAN%  ⏬ [3/7] Mengunduh ^& Menginstal Telegram...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id Telegram.TelegramDesktop -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Telegram selesai!%RESET%
echo.
echo %CYAN%  ⏬ [4/7] Mengunduh ^& Menginstal Zoom...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id Zoom.Zoom -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Zoom selesai!%RESET%
echo.
echo %CYAN%  ⏬ [5/7] Mengunduh ^& Menginstal Instagram...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install Instagram --source msstore --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Instagram selesai!%RESET%
echo.
echo %CYAN%  ⏬ [6/7] Mengunduh ^& Menginstal Facebook...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install Facebook --source msstore --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Facebook selesai!%RESET%
echo.
echo %CYAN%  ⏬ [7/7] Mengunduh ^& Menginstal TikTok...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install TikTok --source msstore --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ TikTok selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua Social ^& Chat Apps berhasil diinstal!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:MEDIA
cls
echo %YELLOW%╔══════════════════════════════════════════════════════╗%RESET%
echo %YELLOW%║      🎵  MEDIA PLAYERS ^& AUDIO  - [23]               ║%RESET%
echo %YELLOW%╠══════════════════════════════════════════════════════╣%RESET%
echo %YELLOW%║  %WHITE%[1/3]%YELLOW% VLC Media Player                              ║%RESET%
echo %YELLOW%║  %WHITE%[2/3]%YELLOW% Spotify                                       ║%RESET%
echo %YELLOW%║  %WHITE%[3/3]%YELLOW% OBS Studio (Recording ^& Streaming)            ║%RESET%
echo %YELLOW%╠══════════════════════════════════════════════════════╣%RESET%
echo %YELLOW%║  %GREEN%Tekan ENTER untuk install semua%YELLOW%                     ║%RESET%
echo %YELLOW%║  %RED%Tekan 0 lalu ENTER untuk kembali%YELLOW%                    ║%RESET%
echo %YELLOW%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p med_confirm="%WHITE%Pilihan: %RESET%"
if "%med_confirm%"=="0" goto MAINMENU
cls
echo %YELLOW%====================================================================================================%RESET%
echo %CYAN%  🎵 Installing Media Players ^& Audio%RESET%
echo %YELLOW%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/3] Mengunduh ^& Menginstal VLC...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id VideoLAN.VLC -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ VLC selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/3] Mengunduh ^& Menginstal Spotify...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id Spotify.Spotify -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Spotify selesai!%RESET%
echo.
echo %CYAN%  ⏬ [3/3] Mengunduh ^& Menginstal OBS Studio...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id OBSProject.OBSStudio -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ OBS Studio selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua Media ^& Audio berhasil diinstal!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:GAMING
cls
echo %YELLOW%╔══════════════════════════════════════════════════════╗%RESET%
echo %YELLOW%║        🎮  GAMING PLATFORMS  - [24]                  ║%RESET%
echo %YELLOW%╠══════════════════════════════════════════════════════╣%RESET%
echo %YELLOW%║  %WHITE%[1/2]%YELLOW% Steam                                         ║%RESET%
echo %YELLOW%║  %WHITE%[2/2]%YELLOW% Epic Games Launcher                           ║%RESET%
echo %YELLOW%╠══════════════════════════════════════════════════════╣%RESET%
echo %YELLOW%║  %GREEN%Tekan ENTER untuk install semua%YELLOW%                     ║%RESET%
echo %YELLOW%║  %RED%Tekan 0 lalu ENTER untuk kembali%YELLOW%                    ║%RESET%
echo %YELLOW%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p gm_confirm="%WHITE%Pilihan: %RESET%"
if "%gm_confirm%"=="0" goto MAINMENU
cls
echo %YELLOW%====================================================================================================%RESET%
echo %CYAN%  🎮 Installing Gaming Platforms%RESET%
echo %YELLOW%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/2] Mengunduh ^& Menginstal Steam...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id Valve.Steam -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Steam selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/2] Mengunduh ^& Menginstal Epic Games Launcher...%RESET%
echo %YELLOW%  ────────────────────────────────────────────────%RESET%
winget install --id EpicGames.EpicGamesLauncher -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Epic Games selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua Gaming Platforms berhasil diinstal!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:DRIVERS
cls
echo %BLUE%╔══════════════════════════════════════════════════════╗%RESET%
echo %BLUE%║        🛠️   DRIVERS ^& RUNTIMES  - [31]                ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %WHITE%[1/4]%BLUE% VC++ Redistributables AIO                     ║%RESET%
echo %BLUE%║  %WHITE%[2/4]%BLUE% DirectX Runtime (system)                      ║%RESET%
echo %BLUE%║  %WHITE%[3/4]%BLUE% IObit Driver Booster                          ║%RESET%
echo %BLUE%║  %WHITE%[4/4]%BLUE% Snappy Driver Installer                      ║%RESET%
echo %BLUE%╠══════════════════════════════════════════════════════╣%RESET%
echo %BLUE%║  %GREEN%Tekan ENTER untuk install semua%BLUE%                     ║%RESET%
echo %BLUE%║  %RED%Tekan 0 lalu ENTER untuk kembali%BLUE%                    ║%RESET%
echo %BLUE%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p drv_confirm="%WHITE%Pilihan: %RESET%"
if "%drv_confirm%"=="0" goto MAINMENU
cls
echo %BLUE%====================================================================================================%RESET%
echo %CYAN%  🛠️  Installing Drivers ^& Runtimes%RESET%
echo %BLUE%====================================================================================================%RESET%
echo.
echo %CYAN%  ⏬ [1/4] Mengunduh ^& Menginstal VC++ AIO...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id abbodi1406.vcredistRepo -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ VC++ AIO selesai!%RESET%
echo.
echo %CYAN%  ⏬ [2/4] Mengunduh ^& Menginstal DirectX...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Microsoft.DirectX -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ DirectX selesai!%RESET%
echo.
echo %CYAN%  ⏬ [3/4] Mengunduh ^& Menginstal Driver Booster...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id IObit.DriverBooster -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Driver Booster selesai!%RESET%
echo.
echo %CYAN%  ⏬ [4/4] Mengunduh ^& Menginstal Snappy Driver Installer...%RESET%
echo %GREEN%  ────────────────────────────────────────────────%RESET%
winget install --id Snappy.SnappyDriverInstallerOrigin -e --accept-package-agreements --accept-source-agreements
echo %GREEN%  ✅ Snappy Driver selesai!%RESET%
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%  🎉 Semua Drivers ^& Runtimes berhasil diinstal!%RESET%
echo %GREEN%====================================================================================================%RESET%
pause & goto MAINMENU

:ALL
cls
echo %GREEN%====================================================================================================%RESET%
echo %CYAN% ⏳ MENGINSTAL SEMUA SOFTWARE (Proses ini akan memakan waktu sangat lama)%RESET%
echo %WHITE% Siapkan koneksi internet yang stabil!%RESET%
echo %GREEN%====================================================================================================%RESET%
winget install --id Google.Chrome -e --accept-package-agreements --accept-source-agreements
winget install --id Brave.Brave -e --accept-package-agreements --accept-source-agreements
winget install --id Mozilla.Firefox -e --accept-package-agreements --accept-source-agreements
winget install --id Opera.Opera -e --accept-package-agreements --accept-source-agreements
winget install --id Microsoft.Edge -e --accept-package-agreements --accept-source-agreements

winget install --id Microsoft.VisualStudioCode -e --accept-package-agreements --accept-source-agreements
winget install --id Anysphere.Cursor -e --accept-package-agreements --accept-source-agreements
winget install --id Apache.NetBeans -e --accept-package-agreements --accept-source-agreements
winget install --id JetBrains.IntelliJIDEA.Community -e --accept-package-agreements --accept-source-agreements
winget install --id JetBrains.PyCharm.Community -e --accept-package-agreements --accept-source-agreements
winget install --id SublimeHQ.SublimeText.4 -e --accept-package-agreements --accept-source-agreements

winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
winget install --id GitHub.GitHubDesktop -e --accept-package-agreements --accept-source-agreements
winget install --id Postman.Postman -e --accept-package-agreements --accept-source-agreements
winget install --id Oracle.JDK.21 -e --accept-package-agreements --accept-source-agreements
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
winget install --id Python.Python.3.12 -e --accept-package-agreements --accept-source-agreements

winget install --id Oracle.MySQLWorkbench -e --accept-package-agreements --accept-source-agreements
winget install --id ApacheFriends.Xampp.8.2 -e --accept-package-agreements --accept-source-agreements
winget install --id leokhoa.laragon -e --accept-package-agreements --accept-source-agreements

winget install --id Microsoft.Office -e --accept-package-agreements --accept-source-agreements
winget install --id Kingsoft.WPSOffice -e --accept-package-agreements --accept-source-agreements
winget install --id Canva.Canva -e --accept-package-agreements --accept-source-agreements
winget install --id Adobe.Acrobat.Reader.64-bit -e --accept-package-agreements --accept-source-agreements

winget install --id RARLab.WinRAR -e --accept-package-agreements --accept-source-agreements
winget install --id 7zip.7zip -e --accept-package-agreements --accept-source-agreements
winget install --id Microsoft.PowerToys -e --accept-package-agreements --accept-source-agreements
winget install --id Rufus.Rufus -e --accept-package-agreements --accept-source-agreements

winget install --id Discord.Discord -e --accept-package-agreements --accept-source-agreements
winget install --id WhatsApp.WhatsApp -e --accept-package-agreements --accept-source-agreements
winget install --id Telegram.TelegramDesktop -e --accept-package-agreements --accept-source-agreements
winget install --id Zoom.Zoom -e --accept-package-agreements --accept-source-agreements
winget install Instagram --source msstore --accept-package-agreements --accept-source-agreements
winget install Facebook --source msstore --accept-package-agreements --accept-source-agreements
winget install TikTok --source msstore --accept-package-agreements --accept-source-agreements

winget install --id VideoLAN.VLC -e --accept-package-agreements --accept-source-agreements
winget install --id Spotify.Spotify -e --accept-package-agreements --accept-source-agreements
winget install --id OBSProject.OBSStudio -e --accept-package-agreements --accept-source-agreements
winget install --id Valve.Steam -e --accept-package-agreements --accept-source-agreements
winget install --id EpicGames.EpicGamesLauncher -e --accept-package-agreements --accept-source-agreements

winget install --id abbodi1406.vcredistRepo -e --accept-package-agreements --accept-source-agreements
winget install --id Microsoft.DirectX -e --accept-package-agreements --accept-source-agreements
winget install --id IObit.DriverBooster -e --accept-package-agreements --accept-source-agreements
winget install --id Snappy.SnappyDriverInstallerOrigin -e --accept-package-agreements --accept-source-agreements
echo.
echo %CYAN%🎉 SEMUA INSTALASI SEGERA SELESAI, ANAK RPL SIAP TEMPUR!%RESET%
echo %WHITE%💻 Credit: ig@ikifer%RESET%
pause
goto MAINMENU

:: =====================================================================
:: TWEAKS AND CLEANER SECTION
:: =====================================================================

:CLEANER
cls
echo %GREEN%╔══════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║        🧹  [41] BERSINKAN CACHE ^& SAMPAH            ║%RESET%
echo %GREEN%╚══════════════════════════════════════════════════════╝%RESET%
echo.
echo %WHITE%Menghapus Temporary Files...%RESET%
del /q /f /s "%TEMP%\*" 2>nul
del /q /f /s "C:\Windows\Temp\*" 2>nul
echo %WHITE%Menghapus Cache Windows Update...%RESET%
net stop wuauserv >nul 2>&1
del /q /f /s "C:\Windows\SoftwareDistribution\Download\*" 2>nul
net start wuauserv >nul 2>&1
echo %WHITE%Menghapus Prefetch...%RESET%
del /q /f /s "C:\Windows\Prefetch\*" 2>nul
echo %WHITE%Mengosongkan Recycle Bin...%RESET%
rd /s /q "C:\$Recycle.Bin" 2>nul
echo.
echo %GREEN%✅ Pembersihan selesai! Ruang disk berhasil dibebaskan.%RESET%
pause & goto MAINMENU

:HIBERNASI
cls
echo %GREEN%╔══════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║        💤  [42] AKTIFKAN / MATIKAN HIBERNASI        ║%RESET%
echo %GREEN%╚══════════════════════════════════════════════════════╝%RESET%
echo.
echo %WHITE%[1] Aktifkan Hibernasi%RESET%
echo %WHITE%[2] Matikan Hibernasi%RESET%
echo.
set /p hib="%WHITE%Pilih (1/2): %RESET%"
if "%hib%"=="1" (
    powercfg /hibernate on
    echo %GREEN%✅ Hibernasi DIAKTIFKAN.%RESET%
) else if "%hib%"=="2" (
    powercfg /hibernate off
    echo %YELLOW%⚡ Hibernasi DIMATIKAN. File hiberfil.sys telah dihapus.%RESET%
) else (
    echo %RED%❌ Pilihan tidak valid.%RESET%
)
pause & goto MAINMENU

:EVENTLOG
cls
echo %GREEN%╔══════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║        📋  [43] HAPUS LOG EVENT VIEWER              ║%RESET%
echo %GREEN%╚══════════════════════════════════════════════════════╝%RESET%
echo.
echo %WHITE%Menghapus semua log Event Viewer...%RESET%
wevtutil cl System 2>nul
wevtutil cl Application 2>nul
wevtutil cl Security 2>nul
wevtutil cl Setup 2>nul
echo %GREEN%✅ Semua log Event Viewer berhasil dihapus.%RESET%
pause & goto MAINMENU

:STOPWU
cls
echo %GREEN%╔══════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║        🔒  [44] MATIKAN / AKTIFKAN UPDATE           ║%RESET%
echo %GREEN%╚══════════════════════════════════════════════════════╝%RESET%
echo.
echo %WHITE%[1] Matikan Windows Update%RESET%
echo %WHITE%[2] Aktifkan Windows Update%RESET%
echo.
set /p wu="%WHITE%Pilih (1/2): %RESET%"
if "%wu%"=="1" (
    sc stop wuauserv >nul 2>&1
    sc config wuauserv start= disabled >nul
    sc stop UsoSvc >nul 2>&1
    sc config UsoSvc start= disabled >nul
    echo %YELLOW%⚡ Windows Update DIMATIKAN.%RESET%
) else if "%wu%"=="2" (
    sc config wuauserv start= auto >nul
    sc start wuauserv >nul 2>&1
    sc config UsoSvc start= auto >nul
    sc start UsoSvc >nul 2>&1
    echo %GREEN%✅ Windows Update DIAKTIFKAN kembali.%RESET%
) else (
    echo %RED%❌ Pilihan tidak valid.%RESET%
)
pause & goto MAINMENU

:: =====================================================================
:: SYSTEM TOOLS SECTION
:: =====================================================================

:SFC
cls
echo %GREEN%╔══════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║        🛡️   [51] SYSTEM FILE CHECKER (SFC)           ║%RESET%
echo %GREEN%╚══════════════════════════════════════════════════════╝%RESET%
echo.
echo %WHITE%Memindai dan memperbaiki file sistem Windows yang rusak...%RESET%
echo %GRAY%(Proses ini bisa memakan waktu 10-20 menit, harap bersabar)%RESET%
echo.
sfc /scannow
echo.
echo %GREEN%✅ SFC selesai! Jika ditemukan error, jalankan [52] DISM untuk perbaikan lanjutan.%RESET%
pause & goto MAINMENU

:DISM
cls
echo %GREEN%╔══════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║        🔧  [52] DISM - PERBAIKAN WINDOWS             ║%RESET%
echo %GREEN%╚══════════════════════════════════════════════════════╝%RESET%
echo.
echo %WHITE%[1/3] Memeriksa health image Windows...%RESET%
DISM /Online /Cleanup-Image /CheckHealth
echo.
echo %WHITE%[2/3] Scan health lebih mendalam...%RESET%
DISM /Online /Cleanup-Image /ScanHealth
echo.
echo %WHITE%[3/3] Memperbaiki komponen Windows...%RESET%
DISM /Online /Cleanup-Image /RestoreHealth
echo.
echo %GREEN%✅ DISM selesai! Disarankan restart PC setelah ini.%RESET%
pause & goto MAINMENU

:ADDUSER
cls
echo %GREEN%╔══════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║        👤  [53] TAMBAH USER ^& ADMINISTRATOR         ║%RESET%
echo %GREEN%╚══════════════════════════════════════════════════════╝%RESET%
echo.
set /p newuser="%WHITE%Masukkan nama user baru: %RESET%"
set /p newpass="%WHITE%Masukkan password (kosongkan jika tanpa password): %RESET%"
echo.
net user "%newuser%" "%newpass%" /add
echo %WHITE%Menjadikan Administrator...%RESET%
net localgroup Administrators "%newuser%" /add
echo.
echo %GREEN%✅ User "%newuser%" berhasil dibuat sebagai Administrator!%RESET%
pause & goto MAINMENU

:SYSINFO
cls
echo %GREEN%╔══════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║        📊  [54] INFORMASI SISTEM LENGKAP            ║%RESET%
echo %GREEN%╚══════════════════════════════════════════════════════╝%RESET%
echo.
systeminfo
echo.
pause & goto MAINMENU

:DISKCLN
cls
echo %GREEN%╔══════════════════════════════════════════════════════╗%RESET%
echo %GREEN%║        💾  [55] DISK CLEANUP - PILIH DRIVE          ║%RESET%
echo %GREEN%╚══════════════════════════════════════════════════════╝%RESET%
echo.
echo %CYAN%  Drive yang tersedia di komputer kamu:%RESET%
echo.
for %%d in (C D E F G H) do (
    if exist %%d:\ (
        echo %GREEN%  ^[%%d^]%RESET%  %WHITE%Drive %%d:\%RESET%
    )
)
echo.
set /p drv="%WHITE%  Masukkan huruf drive (contoh: C atau D): %RESET%"
if not defined drv set drv=C
echo.
echo %CYAN%  🧹 Menjalankan Disk Cleanup pada Drive %drv%:\...%RESET%
cleanmgr /d %drv%:
echo.
echo %GREEN%✅ Disk Cleanup Drive %drv%:\ selesai.%RESET%
pause & goto MAINMENU

:AKTIVASI
cls
echo %BLUE%====================================================================================================%RESET%
echo %YELLOW%  ⚡ AKTIVASI WINDOWS - KMS Online Activation%RESET%
echo %BLUE%====================================================================================================%RESET%
echo.
echo %CYAN%[1/5]%RESET% %WHITE%Menghapus product key lama...%RESET%
slmgr /upk
echo.
echo %CYAN%[2/5]%RESET% %WHITE%Membersihkan registry product key...%RESET%
slmgr /cpky
echo.
echo %CYAN%[3/5]%RESET% %WHITE%Memasang GVLK KMS key untuk Windows 11 Pro...%RESET%
slmgr /ipk W269N-WFGWX-YVC9B-4J6C9-T83GX
echo.
echo %CYAN%[4/5]%RESET% %WHITE%Mengatur KMS Server: kms8.msguides.com ...%RESET%
slmgr /skms kms8.msguides.com
echo.
echo %CYAN%[5/5]%RESET% %WHITE%Mengaktifkan Windows secara online...%RESET%
slmgr /ato
echo.
echo %GREEN%====================================================================================================%RESET%
echo %GREEN%✅ Proses Aktivasi Windows selesai! Cek status di: slmgr /xpr%RESET%
echo %GRAY%   Catatan: Aktivasi KMS berlaku 180 hari dan dapat diperbarui otomatis.%RESET%
echo %GREEN%====================================================================================================%RESET%
echo.
pause
goto MAINMENU

:EOF
exit
