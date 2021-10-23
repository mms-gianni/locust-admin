<template>
    <v-app>
        <v-app-bar app color="#125338" dark>
            <img src="img/locust_small.png" alt="Locust Swarm Logo" height="30" style="margin-right:10px">
            <h1>Swarm Admin</h1>
        </v-app-bar>

        <v-navigation-drawer
            app
            class="pt-4"
            color="grey lighten-3"
            permanent
            expand-on-hover
        >
            <v-list nav dense >
                <v-list-item link to="/">
                    <v-list-item-icon>
                    <v-icon>mdi-server</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Instances</v-list-item-title>
                </v-list-item>
                
                <v-list-item link to="/configlist">
                    <v-list-item-icon>
                    <v-icon>mdi-file-cog-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Locustfiles</v-list-item-title>
                </v-list-item>
                
                <!--
                <v-list-item link to="/library">
                    <v-list-item-icon>
                    <v-icon>mdi-bookshelf</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Library</v-list-item-title>
                </v-list-item>
                
                <v-list-item link to="/ingress">
                    <v-list-item-icon>
                    <v-icon>mdi-web</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>URL's</v-list-item-title>
                </v-list-item>
                -->
            </v-list>

        </v-navigation-drawer>

        <v-main>
            <router-view></router-view>
        </v-main>
        
        <Appfooter :swarmversion="status.swarmversion" :kubeversion="status.kubeVersion.gitVersion" />
    </v-app>
</template>

<script>
import axios from "axios";
import Appfooter from "./components/appfooter.vue";

export default {
    name: "App",
    components: {
        Appfooter
    },
    mounted() {
        axios
            .get("/api/status")
            .then((result) => {
                this.status = result.data;
            })
            .catch((err) => {
                console.error(err);
            });
    },
    data: () => ({
      status: {
        swarmversion: "",
        kubeVersion: {
          gitVersion: ""
        }
      }
    }),
};
</script>
