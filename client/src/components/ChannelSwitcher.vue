<template>
    <Button :label="'Channel: '+selectedChannel.name"  @click="openMenu"/>
    <Menu ref="menu" :model="items" :popup="true"/>
</template>

<script setup lang="ts">
    import { MenuItem } from 'primevue/menuitem';
    import Button from 'primevue/button';
    import { defineProps, ref } from 'vue';
    import { socket } from '@/backend';

    import Menu from 'primevue/menu';
    const menu = ref();
    const openMenu = () => {
        menu.value.toggle(event);
    }

    defineProps({
        items: {
            type: Array as () => MenuItem[],
            default: () => []
        },
        selectedChannel: {
            type: Object,
            default: () => { return {} }
        },
    })
</script>