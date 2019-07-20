<template>
  <main>
    <div class="polygon"></div>
    <h1>It is now {{ time.minutes }} minutes to midnight</h1>
    <analog-clock :minute="time.minutes" :tick="tick" :time="time" />
    <!-- <text-clock :time="time" /> -->
    <aside class="reason" v-html="wikiMostRecentEntry.reason"></aside>
  </main>
</template>

<script>
import AnalogClock from './components/AnalogClock'
// import TextClock from './components/TextClock'
import { tableToJson } from './utils/parse-html'

export default {
  name: 'App',
  components: {
    AnalogClock
    // TextClock
  },
  data() {
    return {
      wikiHTML: null,
      wikiTableEntries: null,
      wikiMostRecentEntry: null,
      tick: 0,
      time: { hours: 0, minutes: 0, seconds: 0 }
    }
  },
  methods: {
    runClock(time) {
      this.tick++
      this.time = {
        hours: time.getHours(),
        minutes: time.getMinutes(),
        seconds: time.getSeconds()
      }
      setTimeout(
        () => this.runClock(new Date()),
        1000 - new Date().getMilliseconds()
      )
    },
    startTicking() {
      this.tick++
      setTimeout(() => this.startTicking(), 1000)
    },
    async fetchWikiData() {
      try {
        const res = await fetch(
          'https://en.wikipedia.org/api/rest_v1/page/html/Doomsday_Clock'
        )
        const text = await res.text()
        if (!res.ok) {
          throw new Error(text)
        }
        const tableContent = text
          .split('<tbody id="mwkg">')[1]
          .split('</tbody>')[0]
        const table = document.createElement('table')
        table.innerHTML = tableContent
        const tableEntries = tableToJson(table)
        const mostRecentEntry = tableEntries[tableEntries.length - 1]
        this.wikiHTML = tableContent
        this.wikiTableEntries = tableEntries
        this.wikiMostRecentEntry = mostRecentEntry
        this.time = {
          hours: 23,
          minutes: 60 - mostRecentEntry.minutestomidnight,
          seconds: 0
        }
      } catch (error) {
        console.error(error)
      }
    }
  },
  mounted() {
    // this.runClock(new Date()),
    this.startTicking(), this.fetchWikiData()
  }
}
</script>

<style lang="scss">
:root {
  --primary-color: hsl(200, 90%, 80%);
  --secondary-color: hsl(200, 30%, 30%);
  --background-color: hsl(200, 30%, 10%);
  --text-color: hsl(200, 30%, 95%);
  --hover-color: hsl(200, 30%, 95%);
  --clock-face: hsl(200, 30%, 75%);
  --clock-seconds-hand: hsl(350, 75%, 50%);
  --tertiary-color: hsl(350, 75%, 50%);
  --send-back-one: -1;
}
html {
  background-color: var(--background-color);
  overflow: hidden;
}
body {
  height: 100vh;
}
main {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--text-color);
  margin-top: 60px;
  display: flex;
  flex-direction: column;
}

a,
sup {
  color: var(--text-color);

  &:hover {
    color: var(--clock-face);
  }
}

.reason {
  padding: 10rem 10rem 0 3rem;
  text-align: left;
}
.polygon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100rem;
  height: 60rem;
  clip-path: polygon(6.5% 346px, 52.78% 20.15%, 50.99% 27.82%, -2px 67.06%);
  background-color: var(--tertiary-color);
  z-index: var(--send-back-one);
}
</style>
