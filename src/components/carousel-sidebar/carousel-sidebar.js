import { trigger, getLocale, lang } from "../../utils"
import auth from "../../api/auth"
import addTag from "../../api/add-tag"

class CarouselSidebar extends HTMLElement {
  constructor() {
    super()

    this.addTagNode = this.querySelector(".carousel-sidebar__tags__add-tag")
    this.addTagNode.addEventListener("click", e => {
      e.preventDefault()
      trigger("carouselSidebar:showSelectizeControl")
    })

    this.bindCustomEvents()

    this.tagsForm = this.querySelector(".carousel-sidebar__tags__form")
    this.tagsFormSubmit = this.tagsForm.querySelector(".carousel-sidebar__tags__form__save")
    this.tagsFormSelectize = this.tagsForm.querySelector(".carousel-sidebar__tags__form__selectize")
    this.initTagsForm()
  }

  set bindData(data) {
    this.data = data
    this.render(getLocale())
  }

  render(propLang) {
    // set sidebar data
    if (propLang === "hu") {
      const locationArray = []
      if (this.data.orszag_name) {
        this.data.orszag_name.forEach(item => {
          locationArray.push(`<a href="?country=${encodeURIComponent(item)}">${item}</a>`)
        })
      }
      if (this.data.varos_name) {
        this.data.varos_name.forEach(item => {
          locationArray.push(`<a href="?city=${encodeURIComponent(item)}">${item}</a>`)
        })
      }
      if (this.data.helyszin_name) {
        this.data.helyszin_name.forEach(item => {
          locationArray.push(`<a href="?place=${encodeURIComponent(item)}">${item}</a>`)
        })
      }
      if (locationArray.length > 0) {
        this.querySelector(".carousel-sidebar__location").style.display = "block"
        this.querySelector(".carousel-sidebar__location h5").innerHTML = locationArray.join(",<br/>")
      } else {
        this.querySelector(".carousel-sidebar__location").style.display = "none"
      }
      this.querySelector(".carousel-sidebar__description").innerHTML = this.data.description
        ? this.data.description
        : ""

      if (this.data.cimke_name) {
        this.querySelector(".carousel-sidebar__tags p").innerHTML = this.data.cimke_name
          ? this.data.cimke_name.map(tag => `<a href="?tag=${encodeURIComponent(tag)}">${tag}</a>`).join(", ")
          : ""
      } else {
        this.querySelector(
          ".carousel-sidebar__tags p"
        ).innerHTML = `<span class="carousel-sidebar__tags__empty">–</span>`
      }
    } else if (propLang === "en") {
      const locationArray = []
      if (this.data.orszag_en) {
        this.data.orszag_en.forEach(item => {
          locationArray.push(`<a href="?country=${encodeURIComponent(item)}">${item}</a>`)
        })
      }
      if (this.data.varos_en) {
        this.data.varos_en.forEach(item => {
          locationArray.push(`<a href="?city=${encodeURIComponent(item)}">${item}</a>`)
        })
      }
      if (this.data.helyszin_en) {
        this.data.helyszin_en.forEach(item => {
          locationArray.push(`<a href="?place=${encodeURIComponent(item)}">${item}</a>`)
        })
      }
      if (locationArray.length > 0) {
        this.querySelector(".carousel-sidebar__location").style.display = "block"
        this.querySelector(".carousel-sidebar__location h5").innerHTML = locationArray.join(",<br/>")
      } else {
        this.querySelector(".carousel-sidebar__location").style.display = "none"
      }

      if (this.data.cimke_en) {
        this.querySelector(".carousel-sidebar__tags p").innerHTML = this.data.cimke_en
          ? this.data.cimke_en.map(tag => `<a href="?tag=${encodeURIComponent(tag)}">${tag}</a>`).join(", ")
          : ""
      } else {
        this.querySelector(
          ".carousel-sidebar__tags p"
        ).innerHTML = `<span class="carousel-sidebar__tags__empty">–</span>`
      }
    }

    this.querySelector(".carousel-sidebar__description").innerHTML = this.data.description ? this.data.description : ""

    this.querySelector(".carousel-sidebar__id h5").innerHTML = `<a href="?id=${this.data.mid}">${this.data.mid}</a>`

    this.querySelector(
      ".carousel-sidebar__year h5"
    ).innerHTML = `<a href="?year=${this.data.year}">${this.data.year}</a>`

    this.querySelector(".carousel-sidebar__donor h5").innerHTML = `<a href="?donor=${encodeURIComponent(
      this.data.adomanyozo_name
    )}">${this.data.adomanyozo_name}</a>`

    if (this.data.szerzo_name) {
      this.querySelector(".carousel-sidebar__photographer h5").innerHTML = `<a href="?photographer=${encodeURIComponent(
        this.data.szerzo_name
      )}">${this.data.szerzo_name}</a>`
      this.querySelector(".carousel-sidebar__photographer").style.display = "block"
    } else {
      this.querySelector(".carousel-sidebar__photographer").style.display = "none"
    }

    // bind history api calls to sidabar anchors
    Array.from(this.querySelectorAll(".carousel-sidebar a:not([class])")).forEach(anchorNode => {
      anchorNode.addEventListener("click", event => {
        event.preventDefault()
        trigger("layoutPhotos:historyPushState", { url: event.currentTarget.href, resetPhotosGrid: true })
      })
    })
  }

  show() {
    document.querySelector("body").classList.remove("hide-carousel-sidebar")
  }

  hide() {
    document.querySelector("body").classList.add("hide-carousel-sidebar")
  }

  toggle() {
    document.querySelector("body").classList.toggle("hide-carousel-sidebar")
  }

  // tags form
  initTagsForm() {
    this.tagsFormSubmit.addEventListener("click", e => {
      e.preventDefault()
      this.submitTagsForm()
        .then(() => {
          this.tagsFormSelectize.reset()
          trigger("snackbar:show", { message: lang("tags_save_success"), status: "success", autoHide: true })
        })
        .catch(() => {
          trigger("snackbar:show", { message: lang("tags_save_error"), status: "error", autoHide: true })
        })
    })

    // reset form submit and submit with Enter
    this.tagsForm.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        e.preventDefault()
      }
    })
    this.tagsForm.addEventListener("submit", e => {
      e.preventDefault()
    })

    // reset selectize control
    setTimeout(() => {
      this.tagsFormSelectize.reset()
      this.hideSelectizeControl()
    }, 100)
  }

  showSelectizeControl() {
    auth.getUserStatus().then(userIsSignedIn => {
      if (userIsSignedIn) {
        this.addTagNode.classList.add("is-hidden")
        this.tagsForm.classList.remove("is-hidden")
        this.tagsFormSelectize.focus()
      } else {
        trigger("snackbar:show", { message: lang("tags_signin_alert"), status: "error", autoHide: true })
        trigger("dialogSignin:show")
      }
    })
  }

  hideSelectizeControl() {
    this.addTagNode.classList.remove("is-hidden")
    this.tagsForm.classList.add("is-hidden")
  }

  submitTagsForm() {
    return new Promise((resolve, reject) => {
      const tags = this.tagsFormSelectize.value

      if (tags.length === 0) reject()

      const addTags = () => {
        return new Promise((res, rej) => {
          const recursiveTagging = () => {
            const tag = tags.shift()

            if (tag) {
              addTag
                .addTag(tag, this.data.uuid[0])
                .then(() => {
                  recursiveTagging()
                })
                .catch(e => {
                  rej(e)
                })
            } else {
              res()
            }
          }
          recursiveTagging()
        })
      }

      addTags()
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  bindCustomEvents() {
    document.addEventListener("carouselSidebar:show", this.show)
    document.addEventListener("carouselSidebar:hide", this.hide)
    document.addEventListener("carouselSidebar:toggle", this.toggle)
    document.addEventListener("carouselSidebar:showSelectizeControl", this.showSelectizeControl.bind(this))
    document.addEventListener("auth:signedOut", this.hideSelectizeControl.bind(this))
    document.addEventListener("photosCarousel:hide", this.hideSelectizeControl.bind(this))
  }
}

window.customElements.define("carousel-sidebar", CarouselSidebar)
