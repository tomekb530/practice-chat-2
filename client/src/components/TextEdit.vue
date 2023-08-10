<template>
    <div class="text-edit">
        <Textarea v-model="value" autoResize @keydown.enter="enterFunc"/>
        <Button @click="openEmoji($event)">
            <template #icon>
                <i class="fa fa-smile-o"></i>
            </template>
        </Button>
    </div>
    <OverlayPanel ref="op">
        <EmojiPicker theme="dark" @select="value=value+$event.i"/>
    </OverlayPanel>
</template>

<script setup lang="ts">
    import Textarea from 'primevue/textarea';
    import Button from 'primevue/button';
    import OverlayPanel from 'primevue/overlaypanel';
    import { ref , defineEmits} from 'vue';
    import  EmojiPicker  from 'vue3-emoji-picker';
    import 'vue3-emoji-picker/css';
    import { useToast } from 'primevue/usetoast';
    const emit = defineEmits(['enter']);
    const cooldown = new Date();
    cooldown.setTime(0);
    const maxBeforeCooldown = 6;
    const consecutiveMessages = ref(0);
    const toast = useToast();
    const op = ref();
    const enterFunc = (ev: any) => {
        if( ev.key === 'Enter' && !ev.shiftKey ){
            ev.preventDefault();
            if((new Date().getTime() - cooldown.getTime()) > 4000 && consecutiveMessages.value < maxBeforeCooldown){    
                emit('enter', value.value);
                value.value = '';
                consecutiveMessages.value++;
            }else{
                toast.add({
                    severity: 'warn',
                    summary: 'Cooldown',
                    detail: 'Please wait a second before sending another message',
                    life: 3000,
                });
                cooldown.setTime(new Date().getTime());
                consecutiveMessages.value = 0;
            }
        }
    }
    const value = ref('');
    const openEmoji = (ev) => {
        op.value.toggle(ev);
    }
</script>

<style scoped lang="scss">
    .text-edit{
        display: flex;
        flex-direction: row;
        height: 100%;
        width: 100%;
    }
    Textarea{
        height: 100%;
        max-height: 50vh;
        resize: none;
        flex: 1 1 auto;
    }
</style>