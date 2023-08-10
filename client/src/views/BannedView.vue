<template>
    <div class="banned">
        <Panel>
            <template #header>
                <h1>Banned</h1>
            </template>
            You're currently banned :&lt;
        </Panel>
    </div>
</template>

<script setup lang="ts">
import Panel from 'primevue/panel';
</script>

<style lang="scss" scoped>
    .banned{
        position:absolute;
        top: 50%;
        left: 50%;
        margin: auto;
        transform: translate(-50%, -50%);
        text-align: center;
    }
</style>