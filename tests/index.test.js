const { default: axios } = require("axios");
const BACKEND_URL = "http://localhost:3000";
describe("Auth", () => {
  test("user is able to sign up only once", async () => {
    const username = "hemant" + Math.random();
    const password = "password";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(response.statusCode).toBe(200);

    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(updatedResponse.statusCode).toBe(400);
  });
  test("signup request fails if user name is not provided", async () => {
    const password = "password";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
      type: "admin",
    });
    expect(response.statusCode).toBe(400);
  });
  test("signin succeeds if the username and password are correct", async () => {
    const username = "hemant" + Math.random();
    const password = "password";
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });
  test("signin fails if the username and password are incorrect", async () => {
    const username = "hemant" + Math.random();
    const password = "password";
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password: "wrongpassword",
    });
    expect(response.statusCode).toBe(403);
  });
});

describe("user metadata endpoints", () => {
  let token = "";
  let avatarId = "";
  beforeAll(async () => {
    const username = "hemant" + Math.random();
    const password = "password";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    token = response.data.token;

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
      imageUrl: "https://www.google.com",
      name: "test",
    });
    avatarId = avatarResponse.data.avatarId;
  });

  test("user can't update their metadata with a wrong avatar id", async () => {
    const response = await axios.put(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "wrongId",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.statusCode).toBe(400);
  });

  test("user can update their metadata with a the right avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: avatarId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.statusCode).toBe(200);
  });
  test("user is not able to update their metadata if the auth header in not present", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId: avatarId,
    });
    expect(response.statusCode).toBe(403);
  });
});

describe("user avatar information", () => {
  let token = "";
  let avatarId = "";
  let userId = "";
  beforeAll(async () => {
    const username = "hemant" + Math.random();
    const password = "password";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    userId = signupResponse.data.userId;
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    token = response.data.token;

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
      imageUrl: "https://www.google.com",
      name: "test",
    });
    avatarId = avatarResponse.data.avatarId;
  });

  test("get back avatar info for a user", async () => {
    const res = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(res.data.avatars.lenght).toBe(1);
    expect(res.data.avatars[0].userId).toBe(userId);
  });

  test("available avatars lists the recently created avatars", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
    expect(response.data.avatars.lenght).not.toBe(0);
    const currentAvatar = response.data.avatars.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});

describe("space information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userToken;
  let userId;
  beforeAll(async () => {
    const username = "hemant" + Math.random();
    const password = "password";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    adminId = signupResponse.data.userId;
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    adminToken = response.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username: username + "-user",
        password,
      }
    );

    userToken = userSigninResponse.data.token;

    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;
    console.log(element2Id);
    console.log(element1Id);
    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "Test space",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    console.log("mapResponse.status");
    console.log(mapResponse.data.id);

    mapId = mapResponse.data.id;
  });

  test("User is able to create a space", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "test space",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(response.spaceId).toBeDefined();
  });
  test("User is unable to create space without mapId and dimensions", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "test space",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(response.statusCode).toBe(400);
  });
  test("User is not able to delete a space that dose not exits ", async () => {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/space/randomid`,
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(response.statusCode).toBe(400);
  });
  test("User is able to delete a space that does exist", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const deleteReponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(deleteReponse.status).toBe(200);
  });
  test("User should not be able to delete a space created by another user", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const deleteReponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(deleteReponse.status).toBe(403);
  });

  test("Admin has no spaces initially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    expect(response.data.spaces.length).toBe(0);
  });

  test("Admin has gets once space after", async () => {
    const spaceCreateReponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    console.log("jhflksdjflksdfjlksdfj");
    console.log(spaceCreateReponse.data);
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    const filteredSpace = response.data.spaces.find(
      (x) => x.id == spaceCreateReponse.data.spaceId
    );
    expect(response.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefined();
  });
});

describe("Arena endpoints", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userToken;
  let userId;
  let spaceId;

  beforeAll(async () => {
      const username = `kirat-${Math.random()}`
      const password = "123456"

      const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
       username,
       password,
       type: "admin"
      });

      adminId = signupResponse.data.userId

      const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
       username: username,
       password
      })

      adminToken = response.data.token

      const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
          username: username + "-user",
          password,
          type: "user"
      });
 
      userId = userSignupResponse.data.userId
  
      const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
          username: username  + "-user",
          password
      })
  
      userToken = userSigninResponse.data.token

      const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          "width": 1,
          "height": 1,
        "static": true
      }, {
          headers: {
              authorization: `Bearer ${adminToken}`
          }
      });

      const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          "width": 1,
          "height": 1,
        "static": true
      }, {
          headers: {
              authorization: `Bearer ${adminToken}`
          }
      })
      element1Id = element1Response.data.id
      element2Id = element2Response.data.id

      const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
          "thumbnail": "https://thumbnail.com/a.png",
          "dimensions": "100x200",
          name: "Default space",
          "defaultElements": [{
                  elementId: element1Id,
                  x: 20,
                  y: 20
              }, {
                elementId: element1Id,
                  x: 18,
                  y: 20
              }, {
                elementId: element2Id,
                  x: 19,
                  y: 20
              }
          ]
       }, {
          headers: {
              authorization: `Bearer ${adminToken}`
          }
       })
       mapId = mapResponse.data.id

      const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
          "name": "Test",
          "dimensions": "100x200",
          "mapId": mapId
      }, {headers: {
          "authorization": `Bearer ${userToken}`
      }})
      console.log(spaceResponse.data)
      spaceId = spaceResponse.data.spaceId
  });

  test("Incorrect spaceId returns a 400", async () => {
      const response = await axios.get(`${BACKEND_URL}/api/v1/space/123kasdk01`, {
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      });
      expect(response.status).toBe(400)
  })

  test("Correct spaceId returns all the elements", async () => {
      const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      });
      console.log(response.data)
      expect(response.data.dimensions).toBe("100x200")
      expect(response.data.elements.length).toBe(3)
  })

  test("Delete endpoint is able to delete an element", async () => {
      const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      });

      console.log(response.data.elements[0].id )
      let res = await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
          data: {id: response.data.elements[0].id},
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      });


      const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      });

      expect(newResponse.data.elements.length).toBe(2)
  })

  test("Adding an element fails if the element lies outside the dimensions", async () => {
     const newResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
          "elementId": element1Id,
          "spaceId": spaceId,
          "x": 10000,
          "y": 210000
      }, {
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      });

      expect(newResponse.status).toBe(400)
  })

  test("Adding an element works as expected", async () => {
      await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
          "elementId": element1Id,
          "spaceId": spaceId,
          "x": 50,
          "y": 20
      }, {
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      });

      const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      });

      expect(newResponse.data.elements.length).toBe(3)
  })

})

describe("Admin Endpoints", () => {
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll(async () => {
      const username = `kirat-${Math.random()}`
      const password = "123456"

      const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
       username,
       password,
       type: "admin"
      });

      adminId = signupResponse.data.userId

      const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
       username: username,
       password
      })

      adminToken = response.data.token

      const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
          username: username + "-user",
          password,
          type: "user"
      });
 
      userId = userSignupResponse.data.userId
  
      const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
          username: username  + "-user",
          password
      })
  
      userToken = userSigninResponse.data.token
  });

  test("User is not able to hit admin Endpoints", async () => {
      const elementReponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          "width": 1,
          "height": 1,
        "static": true
      }, {
          headers: {
              authorization: `Bearer ${userToken}`
          }
      });

      const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
          "thumbnail": "https://thumbnail.com/a.png",
          "dimensions": "100x200",
          "name": "test space",
          "defaultElements": []
       }, {
          headers: {
              authorization: `Bearer ${userToken}`
          }
      })

      const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
          "name": "Timmy"
      }, {
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      })

      const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      }, {
          headers: {
              "authorization": `Bearer ${userToken}`
          }
      })

      expect(elementReponse.status).toBe(403)
      expect(mapResponse.status).toBe(403)
      expect(avatarResponse.status).toBe(403)
      expect(updateElementResponse.status).toBe(403)
  })

  test("Admin is able to hit admin Endpoints", async () => {
      const elementReponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          "width": 1,
          "height": 1,
        "static": true
      }, {
          headers: {
              authorization: `Bearer ${adminToken}`
          }
      });

      const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
          "thumbnail": "https://thumbnail.com/a.png",
          "name": "Space",
          "dimensions": "100x200",
          "defaultElements": []
       }, {
          headers: {
              authorization: `Bearer ${adminToken}`
          }
      })

      const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
          "name": "Timmy"
      }, {
          headers: {
              "authorization": `Bearer ${adminToken}`
          }
      })
      expect(elementReponse.status).toBe(200)
      expect(mapResponse.status).toBe(200)
      expect(avatarResponse.status).toBe(200)
  })

  test("Admin is able to update the imageUrl for an element", async () => {
      const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          "width": 1,
          "height": 1,
        "static": true
      }, {
          headers: {
              authorization: `Bearer ${adminToken}`
          }
      });

      const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`, {
          "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      }, {
          headers: {
              "authorization": `Bearer ${adminToken}`
          }
      })

      expect(updateElementResponse.status).toBe(200);

  })
});
