<template>
    <v-app>
        <v-app-bar app color="#125338" dark>
            <img src="img/locust_white.png" alt="Locust Swarm Logo" height="30" style="margin-right:10px">
            <v-app-bar-title> Locust Swarm </v-app-bar-title>
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
                    <v-list-item-title>Clusters</v-list-item-title>
                </v-list-item>
                <!--
                <v-list-item link to="/test">
                    <v-list-item-icon>
                    <v-icon>mdi-arm-flex-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Loadtest Results</v-list-item-title>
                </v-list-item>
                -->
                <v-list-item link to="/configlist">
                    <v-list-item-icon>
                    <v-icon>mdi-cog-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Locustfiles</v-list-item-title>
                </v-list-item>
            </v-list>

        </v-navigation-drawer>

        <v-main>
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script>
import axios from "axios";

export default {
    name: "App",
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
        status: {},
    }),
};
</script>
