<template>
    <div>
        If this window does not close automatically, please close it manually.
    </div>
</template>

<script setup>
    import {useRouter} from 'vue-router';

    const router = useRouter();
    console.log(router)
</script>