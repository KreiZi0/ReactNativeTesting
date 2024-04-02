import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

import SignIn from "../src/screens/SignIn";

const flushMicrotasksQueue = () =>
  new Promise((resolve) => setImmediate(resolve));

const waitFor = async (conditionCallback, timeout = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (conditionCallback()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timeout while waiting for condition to be met");
};

it("renders default navigation screens", () => {
  const { getAllByText, getByPlaceholderText } = render(<SignIn />);

  // Check if there are two elements with text "Login"
  expect(getAllByText("Login").length).toBe(2);

  // Check if there's an input with placeholder text "example"
  getByPlaceholderText("example");

  // Check if there's an input with placeholder text "***"
  getByPlaceholderText("***");
});


it("renders default elements", () => {
  const { getAllByText, getByPlaceholderText } = render(<SignIn />);

  expect(getAllByText("Login").length).toBe(2);
  getByPlaceholderText("example");
  getByPlaceholderText("***");
});

it("shows invalid input messages", () => {
  const { getByTestId, getByText } = render(<SignIn />);

  fireEvent.press(getByTestId("SignIn.Button"));

  getByText("Invalid username.");
  getByText("Invalid password.");
});

it("shows invalid user name error message", () => {
  const { getByTestId, getByText, queryAllByText } = render(<SignIn />);

  fireEvent.changeText(getByTestId("SignIn.passwordInput"), "qwerty");

  fireEvent.press(getByTestId("SignIn.Button"));

  getByText("Invalid username.");
  expect(queryAllByText("Invalid password.").length).toBe(0);

  fireEvent.changeText(getByTestId("SignIn.usernameInput"), "invalid input");

  getByText("Invalid username.");
  expect(queryAllByText("Invalid password.").length).toBe(0);
});

it("shows invalid password error message", () => {
  const { getByTestId, getByText, queryAllByText } = render(<SignIn />);

  fireEvent.changeText(getByTestId("SignIn.usernameInput"), "admin");

  fireEvent.press(getByTestId("SignIn.Button"));

  getByText("Invalid password.");
  expect(queryAllByText("Invalid username.").length).toBe(0);

  fireEvent.changeText(getByTestId("SignIn.passwordInput"), "invalid input");

  getByText("Invalid password.");
  expect(queryAllByText("Invalid username.").length).toBe(0);
});

it("handles valid input submission", async () => {
  fetch.mockResponseOnce(JSON.stringify({ passes: true }));

  const pushMock = jest.fn();
  const { getByTestId } = render(<SignIn navigation={{ push: pushMock }} />);

  fireEvent.changeText(getByTestId("SignIn.usernameInput"), "admin");
  fireEvent.changeText(getByTestId("SignIn.passwordInput"), "qwerty");
  fireEvent.press(getByTestId("SignIn.Button"));

  expect(fetch.mock.calls).toMatchSnapshot();
  await act(async () => {
    await flushMicrotasksQueue();
    await waitFor(() => pushMock.mock.calls.length > 0);
  });

  expect(pushMock).toBeCalledWith("App");
  
});
