const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000')

})
afterEach(async () => {
    await page.close();
})



describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');

    })

    test('can see blog create form', async () => {

        const label = await page.getContentsOf('form label')
        expect(label).toEqual('Blog Title')

    })

    describe('And using valid inputs', async () => {

        beforeEach(async () => {
            // Enter a text
            await page.type('.title input', 'My Title')
            await page.type('.content input', 'My content')

            await page.click('form button');
        })
        test('submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');

            expect(text).toEqual('Please confirm your entries');
        })

        test('submitting then saving adds blog to index page', async () => {

            await page.click('button.green')
            // when making a request to a backend waitFor it to perform
            await page.waitFor('.card')

            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')

            expect(title).toEqual('My Title');
            expect(content).toEqual('My content');
        })

    })
    describe('And using invalid inputs', async () => {

        beforeEach(async () => {
            await page.click('form button');
        })

        test('the tests shows an error message', async () => {
             const titleError = await page.getContentsOf('.title .red-text');
             const contentError = await page.getContentsOf('.content .red-text');


             expect(titleError).toEqual('You must provide a value');
             expect(contentError).toEqual('You must provide a value');
        })
    })
})

describe('When user is not logged in', async () => {

    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'T',
                content: 'C'
            }
        }
    ]

    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        for (let result of results){
            expect(result).toEqual({error: 'You must log in!'})
        }

    })
    // test('User cannot create blog posts', async () => {
    //     const result = await page.post('/api/blogs', {title: 'T', content: 'C'})
    //
    //     console.log('Result: ', result)
    //     expect(result).toEqual({error: 'You must log in!'})
    // })
    //
    // test('User cannot get a list of posts', async () => {
    //     const result = await page.get('/api/blogs');
    //
    //     expect(result).toEqual({error: 'You must log in!'})
    // })
})
