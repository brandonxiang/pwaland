<script>
  // @ts-nocheck
  export let Page;
  export let pageProps;
  import Link from '../components/Link.svelte';
  import CNavbar from '../components/c-navbar.svelte'
</script>

<svelte:head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>


<CNavbar/>

<main>
  <svelte:component this={Page} {...pageProps} />
</main>


<style>
  :global(body) {
    font-family: sans-serif;
    margin: 0;
  }

  :global(*),
  :global(*::before)
  :global(*::after) {
    box-sizing: border-box;
  }

  :global(a) {
    text-decoration: none;
  }

  main {
    text-align: center;
    margin: 0;
  }

</style>