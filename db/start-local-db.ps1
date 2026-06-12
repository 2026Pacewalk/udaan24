# Starts the dedicated local MySQL instance for Udaan24 (port 3307).
# This instance has its own data dir under app/.localdb and is NOT a Windows
# service, so it must be restarted after a reboot. Run this, leave it open,
# then `npm run dev` in another terminal.
#
#   powershell -ExecutionPolicy Bypass -File "F:\Udaan24 Website\app\db\start-local-db.ps1"

$mysqld  = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
$basedir = "C:\Program Files\MySQL\MySQL Server 8.4"
$datadir = "F:\Udaan24 Website\app\.localdb\data"

Write-Host "Starting Udaan24 MySQL on port 3307 (root, no password)..."
& $mysqld --basedir="$basedir" --datadir="$datadir" --port=3307 --mysqlx=0 --console
