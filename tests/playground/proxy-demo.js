class Page {
    goto(){
        console.log("Going to new page")
    }
    setCookie(){
        console.log("Setting a cookie")
    }
}

class CustomPage {
    static build(){
        const page = new Page();
        const customPage =  new CustomPage(page);

        const superPage = new Proxy(customPage, {
            get(target, p, receiver) {
                return target[p] || page[p]
            }
        });
        return superPage;
    }

    constructor(page) {
        this.page = page;
    }

    login(){
        this.page.goto()
        this.page.setCookie();
    }
}
