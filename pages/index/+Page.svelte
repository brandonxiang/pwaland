<script>
  import { request } from "../../services/utils"
  import { onMount } from "svelte"

  function sortLetter(input) {
    return input.sort((a, b) => {
      if (a.title < b.title) {
        return -1
      } else if (a.title === b.title) {
        return 0
      } else {
        return 1
      }
    })
  }

  function onImgError(e) {
    e.target.src = "/noimage.png"
  }
  
  /**
   * @type {*}
   */
  let pwalist = []

  function getStorageObj() {
    const res = localStorage.getItem("pwa-list")
    try {
      return JSON.parse(res)
    } catch (error) {
      console.error("Json parse error", error)
    }
    return
  }

  function setStorageObj(obj) {
    try {
      localStorage.setItem("pwa-list", JSON.stringify(obj))
    } catch (error) {
      console.error("Json stringify error", error)
    }
  }

  onMount(async () => {
    const _pwaList = getStorageObj()
    if (_pwaList) {
      pwalist = _pwaList
    }
    try {
      const { result } = await request(`/api/query-list`)
      pwalist = sortLetter(result)
      setStorageObj(result)
    } catch (error) {
      console.error(error)
    }
  })
</script>

<section class="wrap">
  {#each pwalist as app, index}
    <a href={app.link} class="box" key={index}>
      <img src={app.icon} alt={app.title} on:error={onImgError} />
      <span>{app.title}</span>
    </a>
  {/each}
</section>

<style>


  .wrap {
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
  }

  .box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin: 18px 0;
    flex: 0 0 33%;
    transition: all 0.5s;
  }

  .box:hover {
    transform: scale(1.2);
  }

  .box img {
    width: 48px;
    height: 48px;
    margin-bottom: 10px;
  }

  .box span {
    color: rgb(77 61 146);
    word-break: normal;
    width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  a {
    text-decoration: none;
  }

  @media (min-width: 640px) {
    .box {
      margin: 18px;
      flex: 0;
    }
  }
</style>
