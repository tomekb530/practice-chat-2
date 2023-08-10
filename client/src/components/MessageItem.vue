<template>
    <div class="message-item">
        <div class="message-item__header">
            
            <Avatar v-if="!sender?.avatar" :label="sender?.name[0]" shape="circle" size="large" />
            <Avatar v-else :image="sender?.avatar" shape="circle" size="large" />
            <div class="message-item__name">{{sender?.name}}</div>
            <div class="message-item__time">{{new Date(message?.timestamp).toLocaleTimeString()}}</div>
        </div>
        <div class="message-item__content">
            {{message?.content}}
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';

import Avatar from 'primevue/avatar';
import { getUserInfo } from '@/backend';
import { getMessage } from '@/backend';
const message = ref();
const sender = ref();

onMounted(async () => {    
    loadMsg();
});

const props = defineProps({
    message: {
        type: Object,
        required: true
    }
});

async function loadMsg(){
    let msg = await getMessage(props.message.id);
    if(!msg){
        setTimeout(loadMsg, 1000);
    }else{
        message.value = msg.message;
        sender.value = msg.sender;
    }
}


</script>

<style lang="scss" scoped>
.message-item {
    display: grid;
    overflow: hidden;
    grid-template-columns: 8%  1fr;
    align-items: center;
    padding: 1%;
    border-radius: 0.5rem;
    margin-right: 1rem;
    margin-bottom: 1rem;
    height: fit-content;
    height: 150px;
    &__header {
        margin-right: 1rem;
    }
    &__content {
        font-size: 1.2rem;
    }
    &__name {
        font-weight: bold;
        margin-right: 0.5rem;
    }
    &__time {
        font-size: 0.8rem;
        color: #999;
    }
}
</style>

