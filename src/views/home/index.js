import { openDB } from 'idb';
import mqtt from 'mqtt'

export default {
  data() {
    return {
      db:null,
      mqttSetting:{},
      mqttDataSend:[],
      mqttDataRes:[],
      isConnect:false,

      sendData:{},
      resData:{},

      dialogRes:false,
      dialogSend:false,

      topicRes:[],
      topicSend:[],

      saveLoading:false,
      connectLoading:false,

      connectCount:0,
      client:null,
    }
  },
  mounted: function() {
    this.initDB()
  },
  methods: {
    initDB(){
      openDB('mqttHelper',1,{
        upgrade(db){
          let store = db.createObjectStore('mqttSetting',{
            keyPath: 'id'
          })
          store.createIndex('id', 'id')
          let store2 = db.createObjectStore('mqttDataSend',{
            keyPath: 'id',
            autoIncrement: true
          })
          store2.createIndex('id', 'id')
          let store3 = db.createObjectStore('mqttDataRes',{
            keyPath: 'id',
            autoIncrement: true
          })
          store3.createIndex('id', 'id')
        }
      }).then(res=>{
        this.db = res
        this.loadData().then()
      })
    },
    async loadData(){
      let obj = await this.db.getFromIndex('mqttSetting','id',999)
      if(!obj) {
        obj = {
          id:999,
          address:'',
          port:8083,
          mount:'',
          version:4,
          username:'',
          password:'',
          keepalive:60,
          tls:false
        }
        await this.db.add('mqttSetting',obj)
      }
      this.mqttSetting = obj

      this.loadSendData().then(()=>{})
      this.loadResData().then(()=>{})
    },

    async loadSendData(){
      this.mqttDataSend = await this.db.getAllFromIndex('mqttDataSend', 'id')
    },
    async loadResData(){
      this.mqttDataRes = await this.db.getAllFromIndex('mqttDataRes', 'id')
    },

    saveMqttSetting(){
      this.saveLoading = true
      let tx = this.db.transaction('mqttSetting', 'readwrite')
      tx.store.put(this.mqttSetting).then(res=>{
        if(res != 999) {
          this.msgError('????????????')
        }
        this.saveLoading = false
      })
    },

    connectMqtt(){
      // ??????
      let {address,port,mount} = this.mqttSetting
      if(this.$isEmpty(address)){
        this.msgError('??????????????????')
      }
      if(this.$isEmpty(port)){
        this.msgError('???????????????')
      }
      this.connectLoading = true
      this.connectCount = 0
      let clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
      if(address.indexOf('http') == -1) address = `http://${address}:${port}${mount}`
      else{
        address = `${address}:${port}${mount}`
      }
      let options = {
        clean: true,	// ????????????
        connectTimeout: this.mqttSetting.keepalive,	// ????????????
        reconnectPeriod: 3000,	// ??????????????????
        protocol:address.indexOf('https') > - 1 ? 'wss':'ws',
        // ????????????
        clientId:clientId,
        protocolVersion:this.mqttSetting.version,
        username: this.mqttSetting.username,
        password: this.mqttSetting.password
      }
      this.client = mqtt.connect(address,options)
      this.client.on('connect',(res)=>{
        console.log('mqtt ????????????');
        this.isConnect = true
        this.connectCount = 0
        // ??????????????????topic
        setTimeout(()=>{
          this.mqttDataSend.forEach(e=>{
            this.client.subscribe(e.topic, () => {})
          })
          this.mqttDataRes.forEach(e=>{
            this.client.subscribe(e.topic, () => {})
          })
        },100)
      })
      this.client.on("error",(error) =>{
        this.isConnect = false
        console.log("????????????????????????", error)
      })
      this.client.on("reconnect",() =>{
        this.connectCount += 1
        console.log("?????????????????? >> " + this.connectCount)
        if(this.connectCount >= 3){
          this.client.end()
          this.connectLoading = false
          this.client = null
        }
      })
      this.client.on("close", (res)=> {
        this.isConnect = false
        console.log("???????????????")
      })
      this.client.on('message',(topic, message, packet) => {
        console.log(JSON.parse(message.toString()));
        let obj = {
          topic:topic,
          time:this.$formatDate(new Date()),
          msg:message.toString()
        }
        this.topicRes.unshift(obj)
      })
    },
    disconnectMqtt(){
      if(this.isConnect && this.client != null){
        this.client.end(true)
        this.connectLoading = false
        this.isConnect = false
      }
    },

    openRes(obj){
      if(obj){
        this.resData = JSON.parse(JSON.stringify(obj))
      }else{
        this.resData = {}
      }
      this.dialogRes = true
    },
    addRes(){
      let obj = JSON.parse(JSON.stringify(this.resData))
      obj.date = this.$formatDate(new Date())
      if(obj.id){
        this.db.put('mqttDataRes',obj).then(res=>{
          this.dialogRes = false
          if(this.isConnect) this.client.subscribe(obj.topic, () => {})
          this.loadResData().then(()=>{})
        })
      }else{
        this.db.add('mqttDataRes',obj).then(res=>{
          this.dialogRes = false
          if(this.isConnect) this.client.subscribe(obj.topic, () => {})
          this.loadResData().then(()=>{})
        })
      }

    },
    deleteRes(obj){
      this.db.delete('mqttDataRes',obj.id).then(res=>{
        this.loadResData().then(()=>{})
        // ????????????
        if(this.isConnect) this.client.unsubscribe(obj.topic, () => {})
      })
    },

    openSend(obj){
      if(obj){
        this.sendData = JSON.parse(JSON.stringify(obj))
      }else{
        this.sendData = {}
      }
      this.dialogSend = true
    },
    addSend(){
      let obj = JSON.parse(JSON.stringify(this.sendData))
      obj.date = this.$formatDate(new Date())
      if(obj.id){
        this.db.put('mqttDataSend',obj).then(res=>{
          this.dialogSend = false
          if(this.isConnect) this.client.subscribe(obj.topic, () => {})
          this.loadSendData().then(()=>{})
        })
      }else{
        this.db.add('mqttDataSend',obj).then(res=>{
          this.dialogSend = false
          if(this.isConnect) this.client.subscribe(obj.topic, () => {})
          this.loadSendData().then(()=>{})
        })
      }
    },
    deleteSend(obj){
      this.db.delete('mqttDataSend',obj.id).then(res=>{
        if(this.isConnect) this.client.unsubscribe(obj.topic, () => {})
        this.loadSendData().then(()=>{})
      })
    },
    send(obj){
      if(!this.isConnect){
        this.msgError('????????????mqtt??????')
        return
      }
      let t = {
        topic:obj.topic,
        time:this.$formatDate(new Date()),
        msg:obj.content
      }
      this.topicSend.unshift(t)
      this.client.publish(obj.topic,obj.content)
    },
    cleanData(flag){
      if(flag == 1) this.topicRes = []
      else this.topicSend = []
    },
    msgError(msg){
      this.$message({
        message: msg,
        type: 'error'
      });
    },
    msgWarnning(msg){
      this.$message({
        message: msg,
        type: 'warning'
      });
    }
  }
}
