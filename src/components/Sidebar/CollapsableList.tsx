import React, { FunctionComponent, useCallback, useState } from "react";
import { useOvermindState } from "../../overmind";
import { replaceEnvColor } from "../../util/tailwind-utils";
import classNames from "classnames";
import { FaCaretDown, FaCaretRight } from "react-icons/all";

interface CollapsableListProps {
  header: string;
  items: {
    id: string;
    label: string;
    selected: boolean;
  }[];
  onItemClicked: (itemId: string) => void;
}

export const CollapsableList: FunctionComponent<CollapsableListProps> = ({
  header,
  items,
  onItemClicked,
}) => {
  const { selectedEnvironment } = useOvermindState().environments;

  const [collapsed, setCollapsed] = useState(false);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return (
    <div>
      <div
        className="flex flex-row items-center px-2 py-2 cursor-pointer text-gray-300"
        onClick={toggle}
      >
        {collapsed ? (
          <FaCaretRight className="text-sm" />
        ) : (
          <FaCaretDown className="text-sm" />
        )}
        <h3 className="tracking-wider text-sm ml-2">{header}</h3>
      </div>
      <ul
        className={classNames("overflow-hidden pt-1", {
          hidden: collapsed,
        })}
      >
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onItemClicked(item.id)}
              className={replaceEnvColor(
                classNames(
                  "w-full py-2 px-6 text-left text-sm truncate break-all cursor-pointer focus:outline-none",
                  {
                    "bg-envcolor-700 text-white": item.selected,
                  },
                  {
                    "text-gray-500 hover:bg-black focus:bg-black": !item.selected,
                  }
                ),
                selectedEnvironment
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
