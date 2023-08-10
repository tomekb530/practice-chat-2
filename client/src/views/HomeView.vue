<template>
  <div class="home">
    <MegaMenu class="topbar">
      <template #start>
          SuperChat
          <ChannelSwitcher :selectedChannel="channelSettings" :items="channelList"/>
      </template>
      <template #end>
        <span>Current user: {{ user?.name }}</span> <LogoutButton/>
      </template>
    </MegaMenu>
    <div class="messages" ref="messages">
      <MessageItem v-for="message in messagesData" :key="message.id" :message="message"/>
    </div>
    <div class="input">
      <TextEdit @enter="sendMessage"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .home{
    display: flex;
    flex-direction: column;
    height: 100%;
    .topbar{
      flex: 0 1 auto;
    }
    .messages{
      padding-bottom: 2rem;
      margin-top: 1rem;
      margin-bottom: 1rem;
      max-height: 80%;
      flex: 1 1 auto;
      overflow-x: hidden;
      overflow-y: auto;
      :nth-child(odd of .message-item){
        background-color: #ffffff10;
      }
      :nth-child(even of .message-item){
        background-color: #ffffff20;
      }
    }

    .input{
      flex: 0 1 1rem;
      width: 100%;
    }
  }
</style>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import LogoutButton from '@/components/LogoutButton.vue';
  import MegaMenu from 'primevue/megamenu';
  import MessageItem from '@/components/MessageItem.vue';  
  import TextEdit from '@/components/TextEdit.vue';

  import ChannelSwitcher from '@/components/ChannelSwitcher.vue';
  import { MenuItem } from 'primevue/menuitem';
  import { Message } from '@/types/Message';
  import { getCurrentUser, sendMessageData, getChannelList, getMessages, switchCurrentChannel } from '@/backend';
import { socket } from '@/backend';
  const user = ref();
  const messages = ref();
  const messagesData = ref([]);
  const channel = ref(0);
  const channelSettings = ref();
  const channelList = ref([] as MenuItem[]);
  onMounted(() => {
    getData();
  });

  const sendMessage = (message: string) => {
    if(message.trim() === ''){
      return;
    }
    if(message.length > 1000){
      message = message.substring(0, 1000);
    }
    sendMessageData(message, channelSettings.value.id);
  }

  const getData = async () => {
    const channels = await getChannelList();    
    if(channels.data){
      channels.data.channels.forEach((channel: any) => {
        channelList.value.push({
          label: channel.name,
          command: () => {
            channelSettings.value = channel;
            channel.value = channel.id;
            switchCurrentChannel(channel.id);
          }
        });
      });
    }
    channelSettings.value = channels.data.channels[0];
    const currentUser = await getCurrentUser();
    user.value = currentUser.user;

    const messagesT = await getMessages(channelSettings.value.id);
    messagesData.value = messagesT.data.messages;
    setTimeout(()=>{
      messages.value.scrollTop = messages.value.scrollHeight;
    },50);
    socket.on("message", (message: Message) => {
      if(message.channel === channelSettings.value.id){
        messagesData.value.push(message);
        setTimeout(()=>{
          const height = messages.value.scrollHeight;
          messages.value.scrollTop = messages.value.scrollHeight;
        },50);
      }
    });
  }
</script>
