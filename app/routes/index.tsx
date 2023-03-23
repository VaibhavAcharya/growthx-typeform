import type { ActionFunction } from "@remix-run/node";

import type { InputHTMLAttributes } from "react";
import { useCallback, useEffect, useRef, useState, Fragment } from "react";
import { Form, useActionData } from "@remix-run/react";

import type { Schema } from "yup";
import { string, array, ValidationError } from "yup";

import { Combobox, Transition } from "@headlessui/react";

import { arrayToOptions } from "utils/general";
import { parseFromData } from "utils/remix";

import { goalOptions, industries, roleOptions } from "~/constants";

import { CheckIcon } from "@heroicons/react/24/solid";

export const action: ActionFunction = async ({ request }) => {
  const formData = parseFromData(await request.formData());

  try {
    await fetch("https://eo3oi83n1j77wgp.m.pipedream.net", {
      method: "post",
      body: JSON.stringify(formData),
    });
  } catch (e) {
    console.error("Error: Cannot send data to pipedream!");
  }

  // can send emails from here using nodemailer, I just do not have a SMTP account

  return {
    ok: true,
    submittedData: formData,
  };
};

const formFlow: {
  id: string;
  label: string;
  content?: any;
  inputType?: InputHTMLAttributes<HTMLInputElement>["type"];
  inputSchema?: Schema;
  comboboxOptions?: {
    label: string;
    value: string;
  }[];
  choices?: {
    label: string;
    value: string;
    editable?: boolean;
    showIfRole?: string;
  }[];
  maxMultipleChoices?: number;
  cta?: string;
}[] = [
  {
    id: "info",
    label: "Up-skilling requires time commitment",
    content: (
      <p>
        The GrowthX experience is designed by keeping in mind the working hours
        founders & full time operators typically work in.
        <br />
        <br />
        You will spend
        <br />
        - 6 hours/week for the first 5 weeks
        <br />- 15 hours/week for the last 3 weeks
      </p>
    ),
    cta: "I agree",
  },
  {
    id: "fname",
    label: "What's your first name?",
    inputType: "text",
    inputSchema: string().required(),
  },
  {
    id: "lname",
    label: "What's your last name, [fname]?",
    inputType: "text",
    inputSchema: string().required(),
  },
  {
    id: "industries",
    label: "What industry is your company in?",
    content: "We will personalize your learning experience accordingly",
    comboboxOptions: arrayToOptions(industries),
    inputSchema: string().required(),
  },
  {
    id: "role",
    label: "Your role in your company?",
    content: "We want to understand how you spend your time right now.",
    choices: roleOptions,
    inputSchema: string().required(),
  },
  {
    id: "goals",
    label: "[fname], what's your professional goal for the next 12 months?",
    content: "Any 2",
    choices: goalOptions as any,
    maxMultipleChoices: 2,
    inputSchema: array(string())
      .length(2)
      .required()
      .typeError("choose exactly 2"),
  },
  {
    id: "email",
    label: "Email you'd like to register with?",
    content: (
      <p>
        We will keep all our communications with you through this email. Do
        check your spam inbox if you can't find our application received email.
      </p>
    ),
    inputType: "email",
    inputSchema: string().email().required(),
  },
  {
    id: "phone",
    label: "Your phone number",
    content: (
      <p>
        We won't call you unless it is absolutely required to process your
        application.
      </p>
    ),
    inputType: "tel",
    inputSchema: string()
      .matches(
        new RegExp(
          /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
        ),
        "Invalid phone number"
      )
      .required(),
  },
];

export default function Index() {
  const actionData = useActionData();

  const lastSectionIndex = formFlow.length - 1;
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const isCurrentLastSection = currentSectionIndex === lastSectionIndex;

  const formRef = useRef<HTMLFormElement>(null);
  const getCurrentFormData = useCallback(function () {
    return parseFromData(new FormData(formRef.current ?? undefined));
  }, []);
  const replaceDynamicFormValue = useCallback(
    function (input: string) {
      return input.replace(new RegExp(/\[(.+?)\]/g), function (match, capture) {
        return getCurrentFormData()[capture] ?? capture;
      });
    },
    [getCurrentFormData]
  );

  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const checkCurrentSectionError = useCallback(
    function () {
      const currentSection = formFlow[currentSectionIndex];
      if (currentSection.inputSchema) {
        const formData = getCurrentFormData();
        const currentSectionInputValue = formData[currentSection.id];

        try {
          currentSection.inputSchema.validateSync(currentSectionInputValue);

          return true;
        } catch (validationError) {
          if (validationError instanceof ValidationError) {
            setErrorMessage(
              validationError.errors[0] ?? "Unknown error occurred!"
            );
          }

          return false;
        }
      } else {
        return true;
      }
    },
    [getCurrentFormData, currentSectionIndex]
  );

  const nextSection = useCallback(
    function () {
      if (checkCurrentSectionError()) {
        if (isCurrentLastSection) {
          formRef.current?.submit();
        } else {
          setCurrentSectionIndex(function (prevSection) {
            return prevSection + 1;
          });

          setErrorMessage(null);
        }
      }
    },
    [checkCurrentSectionError, isCurrentLastSection]
  );
  const previousSection = useCallback(function () {
    setCurrentSectionIndex(function (prevSection) {
      return prevSection - 1;
    });

    setErrorMessage(null);
  }, []);

  useEffect(
    function () {
      function enterKeyBlockerListener(event: KeyboardEvent) {
        if (event.key === "Enter") {
          event.preventDefault();
          nextSection();
        }
      }
      function alphaKeyOptionSelectorListener(event: KeyboardEvent) {
        if (event.key?.match(/[1-9]/g)) {
          const optionRef = document.querySelector<HTMLInputElement>(
            `[data-option="${event.key}"]`
          );
          if (optionRef) {
            optionRef.checked = !optionRef.checked;
          }
        }
      }

      window.addEventListener("keydown", enterKeyBlockerListener);
      window.addEventListener("keydown", alphaKeyOptionSelectorListener);

      return function () {
        window.removeEventListener("keydown", enterKeyBlockerListener);
        window.removeEventListener("keydown", alphaKeyOptionSelectorListener);
      };
    },
    [nextSection]
  );

  return (
    <div className="">
      <div className="-z-50 fixed -left-1/2 w-[60vh] h-[60vh] md:w-[60vw] md:h-[60vw] bg-[linear-gradient(0deg,_#FF9999_0%,_#CCFF99_25%,_#99FFFF_50%,_#9999FF_75%,_#FF99EE_100%)] opacity-60 md:opacity-100 animate-pulse blur-3xl"></div>
      <div className="-z-50 fixed -right-1/2 w-[60vh] h-[60vh] md:w-[60vw] md:h-[60vw] bg-[linear-gradient(90deg,_#FF9999_0%,_#CCFF99_25%,_#99FFFF_50%,_#9999FF_75%,_#FF99EE_100%)] opacity-60 md:opacity-100 animate-pulse blur-3xl"></div>
      <div className="-z-50 absolute w-full h-[40vh] [mask-image:_linear-gradient(180deg,_black_20%,_transparent)] bg-[url('/images/grid.svg')] bg-[length:_64px] opacity-20"></div>

      <div className="w-full h-1.5 bg-black/10">
        <div
          className="bg-blue-500 h-1.5 transition-[width] duration-1000"
          style={{
            width: `${(currentSectionIndex / (lastSectionIndex + 1)) * 100}%`,
          }}
        ></div>
      </div>

      <div className="w-[min(100%,_840px)] mx-auto p-4 md:p-8 lg:p-12 flex flex-col items-stretch justify-start gap-8 md:gap-16 lg:gap-24">
        <nav className="flex flex-row items-center justify-between gap-4">
          <a
            href="/"
            className="flex flex-row items-center justify-center gap-2"
          >
            <img src="/logo.svg" alt="logo" width={28} height={28} />
            <h1 className="font-black text-xl">GrowthX</h1>
          </a>

          {currentSectionIndex ? (
            <button
              onClick={previousSection}
              className="rounded-full w-8 h-8 bg-black/10 font-medium text-xl"
            >
              ↑
            </button>
          ) : null}
        </nav>

        {actionData?.ok ? (
          <>
            <p className="text-3xl font-bold">
              All done! Thanks for your time.
              <br />
              <span className="text-xs font-mono font-normal break-words">
                Response has been sent to
                `https://eo3oi83n1j77wgp.m.pipedream.net`. ✌
              </span>
            </p>
          </>
        ) : (
          <Form ref={formRef} method="post" replace className="">
            {formFlow.map(function (section, i) {
              const isLastSection = i === lastSectionIndex;
              const isThisCurrentSection = i === currentSectionIndex;

              return (
                <Transition
                  key={i}
                  as="fieldset"
                  show={isThisCurrentSection}
                  unmount={false}
                  enter="transition duration-500"
                  enterFrom="translate-y-full opacity-0"
                  enterTo="translate-y-0 opacity-100"
                  // leave="transition duration-100"
                  // leaveFrom="translate-y-0 opacity-100"
                  // leaveTo="-translate-y-full opacity-0"
                  className={"flex flex-col items-stretch justify-start gap-4"}
                >
                  <label
                    htmlFor={section.id}
                    className="font-bold text-2xl md:text-3xl break-words"
                  >
                    <span className="text-black/50 text-xl">{`${i + 1}.`}</span>{" "}
                    {replaceDynamicFormValue(section.label)}
                  </label>

                  {section.content ? (
                    <div className="text-black/80 flex flex-col items-stretch justify-start gap-2">
                      {section.content}
                    </div>
                  ) : null}

                  {section.inputType ? (
                    <input
                      type={section.inputType}
                      id={section.id}
                      name={section.id}
                      autoFocus
                      placeholder="→ your response"
                      className="min-w-0 w-full bg-transparent text-blue-900 placeholder:text-black/50 font-medium text-2xl leading-none py-2 border-b-2 border-stone-400/50 focus:outline-none focus-visible:border-blue-500"
                      required
                    />
                  ) : null}

                  {section.comboboxOptions ? (
                    <Combobox>
                      <div className="w-full relative">
                        <Combobox.Input
                          id={section.id}
                          name={section.id}
                          autoFocus
                          placeholder="→ type & select an option"
                          className="min-w-0 w-full bg-transparent text-blue-900 placeholder:text-black/50 font-medium text-2xl leading-none py-2 border-b-2 border-stone-400/50 focus:outline-none focus-visible:border-blue-500"
                          required
                        />
                        <Transition
                          as={Fragment}
                          enter="transition ease-in duration-200"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="transition ease-in duration-200"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Combobox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-md bg-white px-2 py-2 flex flex-row items-stretch justify-start flex-wrap gap-2">
                            {section.comboboxOptions.map(function (option) {
                              return (
                                <Combobox.Option
                                  key={option.value}
                                  value={option.value}
                                  className="cursor-pointer rounded-lg px-3 py-1.5 bg-blue-500/20 transition-colors hover:bg-blue-500/40 font-medium text-sm leading-none flex flex-row items-center justify-start gap-2 ui-active:ring-2"
                                >
                                  {function ({ selected }) {
                                    return (
                                      <>
                                        {selected ? (
                                          <CheckIcon
                                            className=""
                                            width={14}
                                            height={14}
                                          />
                                        ) : null}
                                        {option.label}
                                      </>
                                    );
                                  }}
                                </Combobox.Option>
                              );
                            })}
                          </Combobox.Options>
                        </Transition>
                      </div>
                    </Combobox>
                  ) : null}

                  {section.choices ? (
                    <div className="flex flex-col items-stretch justify-start gap-1.5">
                      {section.choices
                        .filter(function (choice) {
                          return !(
                            choice.showIfRole &&
                            choice.showIfRole !== getCurrentFormData()["role"]
                          );
                        })
                        .map(function (choice, ci) {
                          return (
                            <div
                              key={choice.value}
                              className="flex flex-row items-center justify-start gap-2"
                            >
                              <input
                                type={
                                  section.maxMultipleChoices
                                    ? "checkbox"
                                    : "radio"
                                }
                                id={choice.value}
                                name={section.id}
                                value={choice.value}
                                className="hidden peer"
                                data-option={
                                  isThisCurrentSection ? ci + 1 : "no"
                                }
                              />
                              <label
                                htmlFor={choice.value}
                                className="hidden peer-checked:block rounded-full p-1 leading-none bg-green-500/25 text-green-900"
                              >
                                <CheckIcon width={18} height={18} />
                              </label>
                              <label
                                htmlFor={choice.value}
                                className="block peer-checked:hidden rounded-full p-1 leading-none bg-black/10"
                              >
                                <CheckIcon
                                  className="opacity-0"
                                  width={18}
                                  height={18}
                                />
                              </label>
                              <label
                                htmlFor={choice.value}
                                className="rounded-md peer-checked:font-medium text-lg"
                              >
                                {choice.label}{" "}
                                <span className="text-black/50 text-xs">{`(${
                                  ci + 1
                                })`}</span>
                              </label>
                            </div>
                          );
                        })}
                    </div>
                  ) : null}

                  {errorMessage ? (
                    <p className="text-base font-medium text-red-500">
                      {errorMessage}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-row items-center justify-start gap-4">
                    <button
                      type="button"
                      onClick={nextSection}
                      className="rounded-lg px-6 py-3 bg-blue-500/20 border-2 border-solid border-blue-500/20 transition-colors hover:bg-blue-500/40 font-bold text-lg leading-none flex flex-row items-center justify-center gap-2"
                    >
                      {section.cta ?? (isLastSection ? "Submit" : "Next")}
                    </button>
                    <p className="hidden sm:block text-base font-medium text-black/50">
                      or press enter ↵
                    </p>
                  </div>
                </Transition>
              );
            })}
          </Form>
        )}
      </div>
    </div>
  );
}
