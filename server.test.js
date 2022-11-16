const supertest = require("supertest");
const app = require("./server");
const mockSession = require("./__mocks__/cookie-session");
const cookieSession = require("cookie-session");

test("Make request with user_id", () => {
    cookieSession.mockSessionOnce({
        user_id: 1,
    });
    return supertest(app)
        .get("/")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

// describe("TEST petition", () => {
//     it("renders the hp", () => {
//         //ohne id
//         mockSession({});
//         return supertest(app)
//             .get("/")
//             .then((res) => {
//                 expect(res.statusCode).toBe(200);
//                 // expect(res.headers["location"]).toContain("/login");
//                 //expect a redirect for a login user from register/login to ??
//             });
//     });
//     it("renders the hp", () => {
//         mockSession({ user_id: 1 });
//         return supertest(app)
//             .get("/")
//             .then((res) => {
//                 // devtools express redirect
//                 expect(res.statusCode).toBe(301);
//                 // expect(res.headers["location"]).toContain("/login");
//                 //expect a redirect for a login user from register/login to ??
//             });
//     });
// });
