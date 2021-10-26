<template>
<v-container :fluid="true">
    <v-tabs
      v-model="tab"
      background-color="grey darken-1"
      dark
    >
      <v-tab
        v-for="i in libfiles"
        :key="i.name"
      >
        {{ i.name }}
            <v-btn
              v-if="i.name != '__init__.py'"
              icon
              color="white"
              @click="removeLib(i)"
            >
              <v-icon>mdi-delete-circle-outline</v-icon>

            </v-btn>
      </v-tab>
    </v-tabs>

    <v-tabs-items
      v-model="tab"
    >
        <v-tab-item
            v-for="i in libfiles"
            :key="i.name"
        >
            <v-textarea
                filled
                name="input-7-4"
                :value="i.content"
                :rows="i.lines+5"
                v-model="i.content"
            ></v-textarea>
        </v-tab-item>
    </v-tabs-items>





    <v-card-text class="text-center">
      <v-divider
        class="mx-4"
        vertical
      ></v-divider>
      <Form></Form>
      <v-btn
        color="green"
        dark
        @click="saveLib()"
      >
        Save Files
      </v-btn>
    </v-card-text>
        
  </v-container>


</template>


<script>
import axios from "axios";
import Form from "./library_form.vue";
export default {
    data: () => ({
        tab: null,
        libfiles: [],
    }),
    components: {
      Form,
    },
    mounted() {
        this.getLibfileList();
    },
    methods: {
        saveLib() {
          const currentLibfile = this.libfiles[this.tab];
          //console.log(currentLibfile);

          axios.post(`/api/lib/${currentLibfile.name}`, {
            name: currentLibfile.name,
            content: currentLibfile.content
          })
        },
        removeLib(item) {
            axios.delete(`/api/lib/${item.name}`)
            .then(res => {
                this.getLibfileList();
                console.log(res);
            });
        },
        // get Config List from server
        getLibfileList() {
            this.libfiles = [];
            axios.get('/api/lib')
                .then(response => {
                    let liblist = response.data;
                    for (let lib in liblist) {
                        //console.log(liblist[lib]);
                        this.libfiles.push({
                            name: lib,
                            content: liblist[lib],
                            length: liblist[lib].length,
                            lines: (liblist[lib].match(/\n/g) || []).length
                        });
                    }
                    //console.log(this.libfiles);
                }
            )
            .catch((err) => {
                console.error(err);
            });
        },
    },
}
</script>

<style scoped>

.v-tab {
    text-transform: inherit;
}

.v-textarea {
    font-size: smaller;
    line-height: 1rem !important;
    font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;
}
</style>