import GIRepository from "./bindings/gobject-introspection/symbols.ts";
import { GITypeTag } from "./bindings/gobject-introspection/enums.ts";
import { isLittleEndian, toCString } from "./utils.ts";
import { interFromValue, valueFromInter } from "./interface.ts";

// deno-lint-ignore no-explicit-any
export function prepareArg(type: Deno.PointerValue, value: any) {
  if (!value) return 0n;

  const arg = new BigUint64Array(1);
  const dataView = new DataView(arg.buffer);
  const tag = GIRepository.g_type_info_get_tag(type);

  switch (tag) {
    case GITypeTag.GI_TYPE_TAG_BOOLEAN:
      dataView.setInt32(0, Number(value), isLittleEndian);
      break;

    case GITypeTag.GI_TYPE_TAG_UINT8:
      dataView.setUint8(0, Number(value));
      break;

    case GITypeTag.GI_TYPE_TAG_INT8:
      dataView.setInt8(0, Number(value));
      break;

    case GITypeTag.GI_TYPE_TAG_UINT16:
      dataView.setUint16(0, Number(value), isLittleEndian);
      break;

    case GITypeTag.GI_TYPE_TAG_INT16:
      dataView.setInt16(0, Number(value), isLittleEndian);
      break;

    case GITypeTag.GI_TYPE_TAG_UINT32:
      dataView.setUint32(0, Number(value), isLittleEndian);
      break;

    case GITypeTag.GI_TYPE_TAG_INT32:
      dataView.setInt32(0, Number(value), isLittleEndian);
      break;

    case GITypeTag.GI_TYPE_TAG_UINT64:
      dataView.setBigUint64(0, BigInt(value), isLittleEndian);
      break;

    case GITypeTag.GI_TYPE_TAG_INT64:
      dataView.setBigInt64(0, BigInt(value), isLittleEndian);
      break;

    case GITypeTag.GI_TYPE_TAG_FLOAT:
      dataView.setFloat32(0, Number(value), isLittleEndian);
      break;

    case GITypeTag.GI_TYPE_TAG_DOUBLE:
      dataView.setFloat64(0, Number(value), isLittleEndian);
      break;

    case GITypeTag.GI_TYPE_TAG_UTF8:
    case GITypeTag.GI_TYPE_TAG_FILENAME:
      return BigInt(Deno.UnsafePointer.of(toCString(value)));

    /* non-basic types */

    case GITypeTag.GI_TYPE_TAG_ARRAY:
      return BigInt(Deno.UnsafePointer.of(value));

    case GITypeTag.GI_TYPE_TAG_INTERFACE: {
      const info = GIRepository.g_type_info_get_interface(type);
      const result = interFromValue(info, value);
      GIRepository.g_base_info_unref(info);
      return result;
    }
  }

  return arg.at(0);
}

export function prepareRet(type: Deno.PointerValue, buffer: ArrayBufferLike) {
  const dataView = new DataView(buffer);
  const tag = GIRepository.g_type_info_get_tag(type);
  const ptr = dataView.getBigUint64(0, isLittleEndian);

  switch (tag) {
    case GITypeTag.GI_TYPE_TAG_VOID:
      return;

    case GITypeTag.GI_TYPE_TAG_BOOLEAN:
      return Boolean(dataView.getInt32(0, isLittleEndian));

    case GITypeTag.GI_TYPE_TAG_UINT8:
      return dataView.getUint8(0);

    case GITypeTag.GI_TYPE_TAG_INT8:
      return dataView.getInt8(0);

    case GITypeTag.GI_TYPE_TAG_UINT16:
      return dataView.getUint16(0, isLittleEndian);

    case GITypeTag.GI_TYPE_TAG_INT16:
      return dataView.getInt16(0, isLittleEndian);

    case GITypeTag.GI_TYPE_TAG_UINT32:
      return dataView.getUint32(0, isLittleEndian);

    case GITypeTag.GI_TYPE_TAG_INT32:
      return dataView.getInt32(0, isLittleEndian);

    case GITypeTag.GI_TYPE_TAG_UINT64:
      return dataView.getBigUint64(0, isLittleEndian);

    case GITypeTag.GI_TYPE_TAG_INT64:
      return dataView.getBigInt64(0, isLittleEndian);

    case GITypeTag.GI_TYPE_TAG_FLOAT:
      return dataView.getFloat32(0, isLittleEndian);

    case GITypeTag.GI_TYPE_TAG_DOUBLE:
      return dataView.getFloat64(0, isLittleEndian);

    case GITypeTag.GI_TYPE_TAG_UTF8:
    case GITypeTag.GI_TYPE_TAG_FILENAME: {
      if (!ptr) {
        return null;
      }

      return new Deno.UnsafePointerView(ptr).getCString();
    }

    /* non-basic types */

    case GITypeTag.GI_TYPE_TAG_INTERFACE: {
      if (!ptr) {
        return null;
      }

      const info = GIRepository.g_type_info_get_interface(type);
      const result = valueFromInter(info, ptr);
      GIRepository.g_base_info_unref(info);
      return result;
    }

    default:
      return ptr;
  }
}

// deno-lint-ignore no-explicit-any
export function prepareParam(type: Deno.PointerValue, value: any) {
  const tag = GIRepository.g_type_info_get_tag(type);

  switch (tag) {
    case GITypeTag.GI_TYPE_TAG_BOOLEAN:
      return Boolean(value);

    case GITypeTag.GI_TYPE_TAG_UTF8:
    case GITypeTag.GI_TYPE_TAG_FILENAME:
      return new Deno.UnsafePointerView(value).getCString();

    /* non-basic types */

    case GITypeTag.GI_TYPE_TAG_INTERFACE: {
      const info = GIRepository.g_type_info_get_interface(type);
      const result = valueFromInter(info, value);
      GIRepository.g_base_info_unref(info);
      return result;
    }

    default:
      return value;
  }
}