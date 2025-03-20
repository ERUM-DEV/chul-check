const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Database = require('better-sqlite3')

// 데이터베이스 연결 설정
const db = new Database('church.db', { verbose: console.log })

// ... rest of the file ... 