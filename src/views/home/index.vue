<template>
  <div id="home">
    <div class="title">
      MQTT助手
    </div>
    <el-form :model="mqttSetting" size="small" label-width="70px" class="mqtt-from">
      <el-form-item label="主机地址">
        <el-input v-model="mqttSetting.address" placeholder="192.168.1.1"></el-input>
      </el-form-item>
      <el-form-item label="主机端口">
        <el-input v-model="mqttSetting.port" placeholder="8083"></el-input>
      </el-form-item>
      <el-form-item label="挂载地址">
        <el-input v-model="mqttSetting.mount" placeholder="/mqtt"></el-input>
      </el-form-item>
      <el-form-item label="协议版本">
        <el-select v-model="mqttSetting.version" placeholder="协议版本">
          <el-option label="MQTT 3.1.1" :value="4"></el-option>
          <el-option label="MQTT 5" :value="5"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户账号">
        <el-input v-model="mqttSetting.username" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="用户密码">
        <el-input v-model="mqttSetting.password" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="保持时间">
        <el-input v-model.number="mqttSetting.keepalive" ></el-input>
      </el-form-item>
      <el-form-item label="是否TLS">
        <el-select v-model="mqttSetting.tls" >
          <el-option label="是" :value="true"></el-option>
          <el-option label="否" :value="false"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="" style="text-align:right">
        <el-button type="primary" @click="saveMqttSetting" v-loading="saveLoading">保存配置</el-button>
        <el-button v-if="!isConnect" size="small" type="success" @click="connectMqtt" v-loading="connectLoading">开始连接</el-button>
        <el-button v-else type="danger" @click="disconnectMqtt">断开连接</el-button>
      </el-form-item>
    </el-form>

    <div class="mqtt-data">
      <div class="part">
        <div class="sub-title">
          订阅相关
          <el-button size="mini" type="primary" @click="openRes">添加</el-button>
        </div>
        <el-table :data="mqttDataRes" height="300" style="width: 100%;margin-top:10px;">
          <el-table-column align="center" prop="name" label="名称" />
          <el-table-column align="center" prop="topic" label="topic" />
          <el-table-column align="center" prop="date" label="时间" />
          <el-table-column align="center" label="操作" >
            <template slot-scope="scope">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="openRes(scope.row)">
              </el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteRes(scope.row)">
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="re-titles">
          接收区数据
          <i class="el-icon-delete" title="清空接收区" @click="cleanData(1)"/>
        </div>
        <div class="mqtt-receive">
          <div class="re-items" v-for="e in topicRes">
            <div class="re-title">
              <div class="re-topic">{{e.topic}}</div>
              <div class="re-time">{{e.time}}</div>
            </div>
            <div class="re-body">{{e.msg}}</div>
          </div>
        </div>
      </div>
      <div class="part">
        <div class="sub-title">
          发送相关
          <el-button size="mini" type="primary" @click="openSend">添加</el-button>
        </div>

        <el-table :data="mqttDataSend" height="300" style="width: 100%;margin-top:10px;">
          <el-table-column align="center" prop="name" label="名称" />
          <el-table-column align="center" prop="topic" label="topic" />
          <el-table-column align="center" prop="content" label="内容" />
          <el-table-column align="center" prop="date" label="时间" width="180"/>
          <el-table-column align="center" label="操作" width="180">
            <template slot-scope="scope">
              <el-button type="success" size="mini" icon="el-icon-s-promotion" @click="send(scope.row)">
              </el-button>
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="openSend(scope.row)">
              </el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteSend(scope.row)">
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="re-titles">
          发送区数据
          <i class="el-icon-delete" title="清空发送区" @click="cleanData(2)"/>
        </div>
        <div class="mqtt-receive">
          <div class="re-items" v-for="e in topicSend">
            <div class="re-title">
              <div class="re-topic">{{e.topic}}</div>
              <div class="re-time">{{e.time}}</div>
            </div>
            <div class="re-body">{{e.msg}}</div>
          </div>
        </div>
      </div>
    </div>


    <el-dialog title="添加订阅" :visible.sync="dialogRes" width="400px">
      <el-form :model="resData" size="small" label-width="50px">
        <el-form-item label="名称">
          <el-input v-model="resData.name"></el-input>
        </el-form-item>
        <el-form-item label="topic">
          <el-input v-model="resData.topic"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogRes = false">取 消</el-button>
        <el-button size="small" type="primary" @click="addRes">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="添加发送" :visible.sync="dialogSend" width="400px">
      <el-form :model="sendData" size="small" label-width="50px">
        <el-form-item label="名称">
          <el-input v-model="sendData.name"></el-input>
        </el-form-item>
        <el-form-item label="topic">
          <el-input v-model="sendData.topic"></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" :rows="3" v-model="sendData.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogSend = false">取 消</el-button>
        <el-button size="small" type="primary" @click="addSend">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import './index.scss'
export {default} from './index.js'
</script>
