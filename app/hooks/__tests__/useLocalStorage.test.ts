import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLocalStorage } from "../useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("should return the same setValue function reference across renders if key doesn't change", () => {
    const { result, rerender } = renderHook(() => useLocalStorage("test-key", "initial"));
    
    const firstSetValue = result.current[1];
    
    // Trigger a re-render by updating state
    act(() => {
      firstSetValue("updated");
    });
    
    const secondSetValue = result.current[1];
    
    expect(secondSetValue).toBe(firstSetValue);
    
    // Trigger re-render with same props
    rerender();
    const thirdSetValue = result.current[1];
    expect(thirdSetValue).toBe(firstSetValue);
  });

  it("should update localStorage when value changes", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    
    act(() => {
      result.current[1]("updated");
    });
    
    expect(window.localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
  });

  it("should support functional updates", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem("count")).toBe("1");
  });
});
