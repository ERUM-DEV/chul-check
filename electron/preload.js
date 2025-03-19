const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // 인증
    checkPin: (pin) => ipcRenderer.invoke('auth:checkPin', pin),
    
    // 성도 관리
    getMembers: () => ipcRenderer.invoke('members:getAll'),
    addMember: (member) => ipcRenderer.invoke('members:add', member),
    updateMember: (id, field, value, oldValue) => 
        ipcRenderer.invoke('members:update', { id, field, value, oldValue }),
    
    // 출석 관리
    markAttendance: (memberId, date, type) => 
        ipcRenderer.invoke('attendance:mark', { memberId, date, type }),
    removeAttendance: (memberId, date) => ipcRenderer.invoke('attendance:remove', { memberId, date })
}) 