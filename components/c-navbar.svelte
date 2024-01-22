
<script>
  import Link from "./Link.svelte";
</script>
<nav>
  <span class="title">PWALAND</span>
  <a class="link" href="/">Home</a>
  <a class="link" href="/management">Management</a>
  <a class="link" href="https://github.com/brandonxiang/pwaland">Github</a>
</nav>

<style>
  nav {
    height: 80px;
    background-color: rgb(77 61 146);
    padding: 0 20px;
  }

  @media (min-width: 640px) {
		nav {
      padding: 0 80px;
		}
	}

  .title {
    color: white;
    font-weight: 500;
    font-size: 25px;
    line-height: 80px;
    padding-right: 30px;
  }

  .link {
    color: white;
    font-size: 20px;
    line-height: 80px;
    padding-right: 10px;
    text-decoration: none;
  }
</style>