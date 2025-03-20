const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // 인증
    checkPin: (pin) => ipcRenderer.invoke('auth:checkPin', pin),
    
    // 성도 관리
    getAllMembers: () => ipcRenderer.invoke('getAllMembers'),
    addMember: (member) => ipcRenderer.invoke('addMember', member),
    updateMember: (id, field, value, oldValue) => 
        ipcRenderer.invoke('updateMember', { id, field, value, oldValue }),
    
    // 출석 관리
    getTodayAttendance: (date) => ipcRenderer.invoke('attendance:getToday', date),
    markAttendance: (memberId, date, type) => 
        ipcRenderer.invoke('attendance:mark', { memberId, date, type }),
    removeAttendance: (memberId, date) => ipcRenderer.invoke('attendance:remove', { memberId, date }),
    notifyLongAbsence: (memberId) => ipcRenderer.invoke('members:notifyLongAbsence', memberId),
    isAuthenticated: () => ipcRenderer.invoke('auth:isAuthenticated'),
    login: (pin) => ipcRenderer.invoke('auth:login', pin),
    logout: () => ipcRenderer.invoke('auth:logout')
}) 