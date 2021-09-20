<template>
    <v-container :fluid="true">
        <v-layout row wrap>
            <v-flex xs12 md12>

                <v-data-table
                    :headers="headers"
                    :items="instances"
                    :items-per-page="15"
                    class="elevation-0"
                >
                <template v-slot:item="row">
                    <tr>
                        <td><a target=”_blank” :href=row.item.ingressHost>{{row.item.name}}</a></td>
                        <td>{{row.item.namespace}}</td>
                        <td>{{row.item.creationTimestamp}}</td>
                        <td>{{row.item.numUsers}}</td>
                        <td>{{row.item.spawnRate}}</td>
                        <td>{{row.item.worker}}</td>
                        <td>{{row.item.state}}</td>
                        <td>{{row.item.totalRps}}</td>
                        <td>{{row.item.userCount}}</td>
                        <td width="130px">
                            <v-btn
                                color="red darken-4"
                                class="mx-2"
                                fab dark x-small
                                elevation="2"
                                 @click="removeInstance(row.item)"
                                >
                                <v-icon dark>mdi-delete</v-icon>
                            </v-btn>
                            <v-btn
                                v-if="row.item.state === 'running'"
                                color="primary"
                                class="mx-2"
                                fab dark x-small
                                elevation="2"
                                @click="stopLoadtest(row.item)"
                                >
                                <v-icon dark>mdi-stop</v-icon>
                            </v-btn>
                            <v-btn
                                v-if="row.item.state === 'stopped' || row.item.state === 'ready'"
                                color="success"
                                class="mx-2"
                                fab dark x-small
                                elevation="2"
                                 @click="startLoadtest(row.item)"
                                >
                                <v-icon dark>mdi-play</v-icon>
                            </v-btn>
                        </td>
                    </tr>
                </template>
                </v-data-table>
                <v-row>
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                        <Form></Form>
                    </v-col>
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                        <v-checkbox
                            v-model="reload"
                            :label="`Auto reload`"
                        ></v-checkbox>
                    </v-col>
                </v-row>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import axios from "axios";
import Form from "./cluster_form.vue";
export default {
    sockets: {
        updatedStatus(instances) {
            let instancesList = [];
            for (let instance in instances) {
                instancesList.push(instances[instance]);
            }
            this.instances = instancesList;
        },
    },
    mounted() {
        this.loadData();
        setInterval(this.loadDataInterval, 3000);
    },
    data: () => ({
      reload: false,
      headers: [
        {
            text: 'Instance Name',
            align: 'start',
            sortable: false,
            value: 'name',
        },
        { text: 'Namespace', value: 'namespace' },
        { text: 'Creation Timestamp', value: 'creationTimestamp' },
        { text: 'Parallel Users', value: 'numUsers' },
        { text: 'Spawn Rate', value: 'spawnRate' },
        { text: 'Worker', value: 'worker' },
        { text: 'State', value: 'state' },
        { text: 'total Rps', value: 'totalRps' },
        { text: 'user Count', value: 'userCount' },
        {   
            text: '', 
            value: 'stats',
            align: 'end',
            sortable: false,
        },
      ],
      instances: [],
      locustfiles: [],
    }),
    components: {
      Form,
    },
    methods: {
        removeInstance(item) {
            axios.delete(`/api/instance/${item.name}`)
            .then(response => {
                console.log(response);
                const index = this.instances.indexOf(item);
                this.instances.splice(index, 1);
            }).catch(error => {
                console.log(error);
            });
        },
        startLoadtest(item) {
            axios.get(`/api/loadtest/${item.name}/start`).then(response => {
                console.log(response);
                item.state = 'running';
            }).catch(error => {
                console.log(error);
            });
        },
        stopLoadtest(item) {
            axios.delete(`/api/loadtest/${item.name}/stop`).then(response => {
                console.log(response);
                item.state = 'stopped';
            }).catch(error => {
                console.log(error);
            });
        },
        loadDataInterval() {
            if (this.reload) {
                this.refreshData();
            }
        },
        refreshData() {
            axios.get('/api/status')
                .then(response => {
                    for (const instancename in this.instances) {
                        console.log(this.instances[instancename].name);
                        let instanceName = this.instances[instancename].name;
                        let newInstance = response.data.instances[instanceName];
                        console.log(response.data.instances);
                        if (newInstance !== undefined) {
                            this.instances[instancename].totalRps = newInstance.stats.total_rps;
                            this.instances[instancename].state = newInstance.stats.state;
                            this.instances[instancename].userCount = newInstance.stats.user_count;
                        } else {
                            console.log('Instance not found');
                        }
                    }
                }
            )
            .catch((err) => {
                console.error(err);
            });
        },
        // get Config List from server
        loadData() {
            this.instances = [];
            axios.get('/api/status')
                .then(response => {
                    let instances = [];
                    for (const instancename in response.data.instances) {
                        let instance = response.data.instances[instancename];
                        let stats = instance.stats || {
                            state : "dead",
                            total_rps : 0,
                            user_count : 0,
                        };

                        instances.push({
                            name: instance.name,
                            namespace: instance.namespace,
                            ingressHost: "http://"+instance.ingressHost,
                            creationTimestamp: instance.creationTimestamp,
                            numUsers: instance.numUsers,
                            spawnRate: instance.spawnRate,
                            worker: instance.worker,
                            state: stats.state || "dead",
                            totalRps: stats.total_rps || 0,
                            userCount: stats.user_count || 0,
                        });
                    }
                    this.instances = instances;
                    //console.log(this.instances);
                }
            )
            .catch((err) => {
                console.error(err);
            });

        },
    },
}
</script>

<style lang="scss">
</style>