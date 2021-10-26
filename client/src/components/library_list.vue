<template>
    <v-container :fluid="true">

        <v-layout row wrap>
            <v-flex xs12 md12>
                <v-data-table
                    :headers="headers"
                    :items="locustfiles"
                    :items-per-page="15"
                    class="elevation-0"
                >
                <template v-slot:item="row">
                    <tr>
                        <td>{{row.item.name}}</td>
                        <td>{{row.item.length}}</td>
                        <td>
                            <v-btn
                                color="red darken-4"
                                class="mx-2"
                                fab dark x-small
                                elevation="2"
                                 @click="removeLibfile(row.item)"
                                >
                                <v-icon dark>mdi-delete</v-icon>
                            </v-btn>
                            <v-btn
                                color="blue darken-4"
                                class="mx-2"
                                fab dark x-small
                                elevation="2"
                                 @click="editLibfile(row.item)"
                                >
                                <v-icon dark>mdi-pen</v-icon>
                            </v-btn>
                        </td>
                    </tr>
                </template>
                </v-data-table>
            </v-flex>
        </v-layout>
        
        <Form></Form>

    </v-container>
</template>



<script>
import axios from "axios";
import Form from "./config_form.vue";
export default {
    sockets: {
        updatedLocustfiles(locustfiles) {
            let locustfilesList = [];
            for (let locustfile in locustfiles) {
                locustfilesList.push(locustfiles[locustfile]);
            }
            this.locustfiles = locustfilesList;
        },
    },
    mounted() {
        this.getLibfileList();
    },
    data: () => ({
      headers: [
        {
            text: 'Name',
            align: 'start',
            value: 'name',
        },
        { text: 'length', value: 'length' },
        {   
            text: '', 
            value: 'toolbox',
            align: 'end',
            sortable: false,
        },
      ],
      locustfiles: [],
    }),
    components: {
      Form,
    },
    methods: {
        editLibfile(item) {
            console.log(item);
        },
        removeLibfile(item) {
            axios.delete(`/api/lib/${item.name}`)
            .then(response => {
                console.log(response.statusText);
                const index = this.locustfiles.indexOf(item);
                this.locustfiles.splice(index, 1);
            }).catch(error => {
                console.log(error);
            });
        },

        // get Config List from server
        getLibfileList() {
            this.locustfiles = [];
            axios.get('/api/lib')
                .then(response => {
                    let liblist = response.data;
                    for (let lib in liblist) {
                        console.log(liblist[lib]);
                        this.locustfiles.push({
                            name: lib,
                            length: liblist[lib].length,
                            content: liblist[lib],
                        });
                    }
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