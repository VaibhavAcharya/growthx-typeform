import { useCallback, useEffect, useRef, useState } from "react";
import { Form } from "@remix-run/react";

import type { Schema } from "yup";
import { string, ValidationError } from "yup";

import { cx } from "class-variance-authority";

const formFlow: ((
  | { type: "information"; heading: string; content: any }
  | {
      type: "question";
      id: string;
      label: string;
      schema: Schema;
    }
) & { cta?: string })[] = [
  {
    type: "information",
    heading: "Up-skilling requires time commitment",
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
    type: "question",
    id: "fname",
    label: "What's your first name?",
    schema: string().required(),
  },
  {
    type: "question",
    id: "lname",
    label: "What's your last name, [fname]?",
    schema: string().required(),
  },
];

export default function Index() {
  const lastSectionIndex = formFlow.length - 1;
  const [currentSection, setCurrentSection] = useState(0);
  const isCurrentLastSection = currentSection === lastSectionIndex;

  const formRef = useRef<HTMLFormElement>(null);
  const getCurrentFormData = useCallback(function () {
    return new FormData(formRef.current ?? undefined);
  }, []);
  const replaceDynamicFormValue = useCallback(
    function (input: string) {
      // const x = input
      //   .split("[")
      //   .map((y) =>
      //     y.includes("]")
      //       ? y
      //           .split("]")
      //           .map((z, i) => (i === 0 ? getCurrentFormData().get(z) ?? z : z))
      //       : y
      //   );

      return input.replace(new RegExp(/\[(.+?)\]/g), function (match, capture) {
        return getCurrentFormData().get(capture) ?? capture;
      });
    },
    [getCurrentFormData]
  );

  const [error, setError] = useState<null | string>(null);
  const checkCurrentSectionError = useCallback(
    function () {
      const currentSectionObject = formFlow[currentSection];
      if (currentSectionObject.type === "question") {
        const formData = getCurrentFormData();
        const currentSectionInputValue = formData.get(currentSectionObject.id);

        try {
          currentSectionObject.schema.validateSync(currentSectionInputValue);

          return true;
        } catch (validationError) {
          if (validationError instanceof ValidationError) {
            setError(validationError.errors[0] ?? "Unknown error occurred!");
          }

          return false;
        }
      } else {
        return true;
      }
    },
    [getCurrentFormData, currentSection]
  );

  const nextSection = useCallback(
    function () {
      if (checkCurrentSectionError()) {
        if (isCurrentLastSection) {
          formRef.current?.submit();
        } else {
          setCurrentSection(function (prevSection) {
            return prevSection + 1;
          });

          setError(null);
        }
      }
    },
    [checkCurrentSectionError, isCurrentLastSection]
  );

  useEffect(
    function () {
      function enterKeyBlockerListener(event: KeyboardEvent) {
        if (event.key === "Enter") {
          event.preventDefault();
          nextSection();
        }
      }

      window.addEventListener("keydown", enterKeyBlockerListener);

      return function () {
        window.removeEventListener("keydown", enterKeyBlockerListener);
      };
    },
    [nextSection]
  );

  return (
    <div className="overflow-x-hidden">
      <div className="-z-50 fixed -left-1/2 w-[60vh] h-[60vh] md:w-[60vw] md:h-[60vw] bg-[linear-gradient(0deg,_#FF9999_0%,_#CCFF99_25%,_#99FFFF_50%,_#9999FF_75%,_#FF99EE_100%)] opacity-60 md:opacity-100 animate-spin-slow blur-3xl"></div>
      <div className="-z-50 fixed -right-1/2 w-[60vh] h-[60vh] md:w-[60vw] md:h-[60vw] bg-[linear-gradient(90deg,_#FF9999_0%,_#CCFF99_25%,_#99FFFF_50%,_#9999FF_75%,_#FF99EE_100%)] opacity-60 md:opacity-100 animate-spin-slow blur-3xl"></div>
      <div className="-z-50 absolute w-full h-[40vh] [mask-image:_linear-gradient(180deg,_black_20%,_transparent)] bg-[url('/images/grid.svg')] bg-[length:_64px] opacity-20"></div>

      <div className="w-full h-1.5 bg-black/10">
        <div
          className="bg-blue-500 h-1.5"
          style={{
            width: `${(currentSection / (lastSectionIndex + 1)) * 100}%`,
          }}
        ></div>
      </div>

      <div className="w-[min(100%,_840px)] mx-auto p-4 md:p-8 lg:p-12 flex flex-col items-stretch justify-start gap-8 md:gap-16 lg:gap-24">
        <nav className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center justify-center gap-2">
            <img src="/logo.svg" alt="logo" width={28} height={28} />
            <h1 className="font-black text-xl">GrowthX</h1>
          </div>
        </nav>

        <Form
          ref={formRef}
          method="post"
          replace
          className="flex flex-col items-stretch justify-center"
        >
          {formFlow.map(function (section, i) {
            const isLastSection = i === lastSectionIndex;

            return (
              <fieldset
                key={i}
                className={cx(
                  "flex flex-col items-stretch justify-start gap-4",
                  currentSection === i ? "" : "hidden"
                )}
              >
                <>
                  {(function () {
                    if (section.type === "information") {
                      return (
                        <>
                          <p className="font-bold text-xl md:text-3xl">
                            <span className="text-black/50 text-xl">{`${
                              i + 1
                            }.`}</span>{" "}
                            {replaceDynamicFormValue(section.heading)}
                          </p>
                          <div className="text-black/80 flex flex-col items-stretch justify-start gap-2">
                            {section.content}
                          </div>
                        </>
                      );
                    }

                    if (section.type === "question") {
                      return (
                        <>
                          <label
                            htmlFor={section.id}
                            className="font-bold text-2xl md:text-3xl break-words"
                          >
                            <span className="text-black/50 text-xl">{`${
                              i + 1
                            }.`}</span>{" "}
                            {replaceDynamicFormValue(section.label)}
                          </label>
                          <input
                            type="text"
                            id={section.id}
                            name={section.id}
                            placeholder="→ your response"
                            className="bg-transparent text-blue-900 placeholder:text-black/50 font-medium text-2xl leading-none py-2 border-b-2 border-stone-400/50 focus:outline-none focus-visible:border-blue-500"
                          />
                        </>
                      );
                    }
                  })()}
                </>

                {error ? (
                  <p className="text-base font-medium text-red-500">{error}</p>
                ) : null}

                <div className="mt-4 flex flex-row items-center justify-start gap-4">
                  <button
                    type="button"
                    onClick={nextSection}
                    className="rounded-lg px-6 py-3 bg-blue-500/20 border-2 border-solid border-blue-500/20 transition-colors hover:bg-blue-500/40 font-bold text-lg leading-none flex flex-row items-center justify-center gap-2"
                  >
                    {section.cta ?? (isLastSection ? "Submit" : "Next")}
                  </button>
                  <p className="text-base font-medium text-black/50">
                    or press enter ↵
                  </p>
                </div>
              </fieldset>
            );
          })}
        </Form>
      </div>
    </div>
  );
}
