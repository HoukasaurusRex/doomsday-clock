<template>
  <main>
    <div class="polygon"></div>
    <h1>
      It is now {{ 60 - time.minutes }} minute{{
        time.minutes !== 1 ? 's' : ''
      }}
      to midnight
    </h1>
    <analog-clock :minute="time.minutes" :tick="tick" :time="time" />
    <!-- <text-clock :time="time" /> -->
    <aside class="reason" v-html="wikiEntryReason"></aside>
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
      wikiEntryReason: null,
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
          .replace(
            /(href="\.\/)/g,
            'target="_blank" href="https://en.wikipedia.org/wiki/'
          )
        const table = document.createElement('table')
        table.innerHTML = tableContent
        const tableEntries = tableToJson(table)
        const mostRecentEntry = tableEntries[tableEntries.length - 1]
        this.wikiHTML = tableContent
        this.wikiTableEntries = tableEntries
        this.wikiMostRecentEntry = mostRecentEntry
        this.wikiEntryReason = mostRecentEntry.reason
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
  --tablet-width: 900px;
  --xl-phone-width: 650px;
  --sm-phone-width: 500px;
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
  padding: 8rem 10rem 0 3rem;
  text-align: left;

  @media (max-width: 900px) {
    padding: 6rem 5rem 0 5rem;
  }

  @media (max-width: 650px) {
    padding: 4rem 2rem 0 2rem;
  }

  @media (max-width: 500px) {
    padding: 1rem 1rem 0 1rem;
  }
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
