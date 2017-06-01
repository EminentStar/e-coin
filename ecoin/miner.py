"""This module is for mining e-coin."""
from random import randint


MAX_DIGIT=5


def generate_an_operand():
    """ This function generates an operand at most ten thousands place decimal
    which means that the operand could have 5 digits at most. """
    operand_str = ''
    for loop_cnt in range(MAX_DIGIT):
        operand_str += str(randint(0, 9))

    operand = int(operand_str)

    return operand

def generate_a_problem():
    """This function returns operands and the answer that is multiplied"""
    problem = {}
    operand_01 = generate_an_operand()
    operand_02 = generate_an_operand()

    problem['answer'] = operand_01 * operand_02
    problem['operands'] = [operand_01, operand_02]

    return problem

