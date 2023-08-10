<template>
    <div class="panel">
        <Panel>
            <template #header>
                <div class="header">
                    <h1>Login</h1>
                </div>
            </template>
            <div class="form">
                <InputText v-model="email" placeholder="Email" />
                <Password v-model="password" :feedback="false" placeholder="Password" promptLabel=" " @keyup.enter="signIn"/>
                <small v-if="errorMessage != ''" class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                <Button @click="signIn" :loading="normalLoad" label="Login"/>
                <Button @click="signInGoogle" :loading="googleLoad" label="Login with Google"/>
                <hr>
                <Button @click="router.push({name:'register'})" label="Register"/>
            </div>
        </Panel>
    </div>
</template>

<script setup lang="ts">
    import Button from 'primevue/button';
    import InputText from 'primevue/inputtext';
    import Password  from 'primevue/password';
    import Panel from 'primevue/panel';
    import {ref} from 'vue';
    import router from '@/router';
    import { useToast } from "primevue/usetoast";
    import { signInWithEmailAndPassword } from '@/backend';
    import { socket, API_URL } from '@/backend';
    const toast = useToast();
    const email = ref('');
    const password = ref('');
    const normalLoad = ref(false);
    const googleLoad = ref(false);
    const errorMessage = ref('');

    const signInGoogle = async () => {
        googleLoad.value = true;
        errorMessage.value = '';
        const popup = await window.open('http://localhost:2137/auth/google',"Google Login","width=500,height=500");
        window.onmessage = (event) => {
            if(event.data && event.origin === API_URL){
                const data = JSON.parse(event.data);
                if(data && data.token){
                    localStorage.setItem('token', data.token);
                    socket.disconnect();
                    socket.connect();
                    router.push({name:'home'});
                    toast.add({
                        severity: "success",
                        summary: "Login successful",
                        detail: "Welcome back!",
                        life: 3000,
                    });
                }
            }
        }
    }

    const signIn = () => {
        normalLoad.value = true;
        errorMessage.value = '';
        signInWithEmailAndPassword(email.value, password.value)
            .then((result) => {
                if (result.data && result.data.token) {
                    //console.log(result)
                    localStorage.setItem('token', result.data.token);
                    socket.disconnect();
                    socket.connect();
                    router.push({name:'home'});
                    toast.add({
                        severity: "success",
                        summary: "Login successful",
                        detail: "Welcome back!",
                        life: 3000,
                    });
                }
            }).catch((error) => {
                if(error.code === 'auth/user-not-found'){
                    errorMessage.value = 'Wrong email or password';
                }
                else if(error.code === 'auth/invalid-email'){
                    errorMessage.value = 'Wrong email or password';
                }
                else if(error.code === 'auth/wrong-password'){
                    errorMessage.value = 'Wrong email or password';
                }
                else{
                    errorMessage.value = error.message;
                }
            }).finally(() => {
                normalLoad.value = false;
            });
    }
</script>

<script lang="ts">
export default {
    
}
</script>


<style scoped lang="scss">
    .panel{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .form{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 1rem;
    }
    .header{
        text-align: center;
        width: 100%;
    }
    hr{
        width: 100%;
    }
</style>